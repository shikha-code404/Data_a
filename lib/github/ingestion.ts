import { getSupabaseAdmin } from "../db/client";

// Core interface matching the normalized representation
export interface GitHubIngestionResult {
  repositories: {
    name: string;
    description: string | null;
    primary_language: string | null;
    stars: number;
    is_fork: boolean;
  }[];
  languages: Record<string, number>; // language -> percentage weight (0.0 to 1.0)
  commits: {
    total_last_12_months: number;
    by_repository: Record<string, number>;
    active_months: string[];
  };
  pull_requests: {
    opened: number;
    merged: number;
  };
  top_5_repos_by_stars: {
    name: string;
    stars: number;
  }[];
}

/**
 * Robust fetch helper that checks DB cache and handles GitHub 202 response retries.
 */
async function fetchWithCache(
  key: string,
  url: string,
  headers: Record<string, string>,
  retryOn202 = true
): Promise<any> {
  const adminClient = getSupabaseAdmin();
  
  // 1. Try to read from cache first
  try {
    const { data: cacheRow } = await adminClient
      .from("github_api_cache")
      .select("response")
      .eq("key", key)
      .maybeSingle();

    if (cacheRow && cacheRow.response) {
      console.log(`[Cache Hit] GitHub API cache key: ${key}`);
      return cacheRow.response;
    }
  } catch (err) {
    console.warn("Failed to check github_api_cache. Proceeding directly to API.", err);
  }

  // 2. Fetch live data with 202 retry logic
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts <= maxAttempts) {
    console.log(`[Cache Miss] Calling GitHub API: ${url} (Attempt ${attempts + 1})`);
    const response = await fetch(url, { headers });

    if (response.status === 202 && retryOn202 && attempts < maxAttempts) {
      attempts++;
      console.log(`[GitHub API 202 Accepted] Data compiling. Retrying in 1.5s...`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      continue;
    }

    if (!response.ok) {
      throw new Error(`GitHub request failed with status ${response.status}: ${url}`);
    }

    const json = await response.json();

    // Cache raw response in Postgres
    try {
      await adminClient.from("github_api_cache").upsert({
        key,
        response: json,
        created_at: new Date().toISOString(),
      }, {
        onConflict: "key"
      });
    } catch (err) {
      console.error("Failed to save response to github_api_cache:", err);
    }

    return json;
  }

  throw new Error(`GitHub API returned 202 Accepted repeatedly for URL: ${url}`);
}

/**
 * Runs the GitHub ingestion pipeline for a candidate.
 */
export async function ingestGitHubData(
  username: string,
  userId?: string,
  providedAccessToken?: string
): Promise<GitHubIngestionResult> {
  const adminClient = getSupabaseAdmin();
  let accessToken = providedAccessToken;

  // 1. If accessToken is not passed but userId is, try to fetch it from the database
  if (!accessToken && userId) {
    try {
      const { data: profile } = await adminClient
        .from("candidate_profiles")
        .select("github_access_token")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (profile?.github_access_token) {
        accessToken = profile.github_access_token;
      }
    } catch (err) {
      console.error("Error retrieving stored GitHub token:", err);
    }
  }

  // Set up API headers (use token if available, fallback to process.env.GITHUB_TOKEN)
  const token = accessToken || process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Talent-AI-Platform-Ingestion",
  };

  if (token && !token.includes("placeholder")) {
    headers.Authorization = `token ${token}`;
  }

  console.log(`[Ingestion Start] Triggered for user @${username} (Token auth: ${!!headers.Authorization})`);

  // 2. Fetch User Repositories
  const reposUrl = `https://api.github.com/users/${username}/repos?per_page=100`;
  const reposKey = `repos:${username}`;
  const rawRepos = await fetchWithCache(reposKey, reposUrl, headers);

  if (!Array.isArray(rawRepos)) {
    throw new Error(`GitHub repos response is not an array: ${JSON.stringify(rawRepos)}`);
  }

  const repositories = rawRepos.map((repo: any) => ({
    name: repo.name,
    description: repo.description || null,
    primary_language: repo.language || null,
    stars: repo.stargazers_count || 0,
    is_fork: !!repo.fork,
  }));

  // Sort and extract top 5 repos by stars
  const top5Repos = [...repositories]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 5)
    .map((repo) => ({ name: repo.name, stars: repo.stars }));

  // 3. Fetch languages & commits per repository (limit to non-forks to save API requests and focus on candidate's work)
  const nonForkRepos = rawRepos.filter((repo: any) => !repo.fork);
  const languageBytes: Record<string, number> = {};
  const commitCountsByRepo: Record<string, number> = {};
  let totalCommitsLast12Months = 0;
  const activeMonthsSet = new Set<string>();

  for (const repo of nonForkRepos) {
    const repoName = repo.name;
    const owner = repo.owner?.login || username;

    // Fetch languages
    try {
      const langUrl = `https://api.github.com/repos/${owner}/${repoName}/languages`;
      const langKey = `languages:${username}:${repoName}`;
      const repoLangs = await fetchWithCache(langKey, langUrl, headers);

      for (const [lang, bytes] of Object.entries(repoLangs)) {
        languageBytes[lang] = (languageBytes[lang] || 0) + (bytes as number);
      }
    } catch (err) {
      console.warn(`Failed to ingest languages for repo ${repoName}:`, err);
    }

    // Fetch commits (past 12 months weekly commit stats)
    try {
      const commitStatsUrl = `https://api.github.com/repos/${owner}/${repoName}/stats/commit_activity`;
      const commitStatsKey = `commits:${username}:${repoName}`;
      const commitActivity = await fetchWithCache(commitStatsKey, commitStatsUrl, headers);

      if (Array.isArray(commitActivity)) {
        let repoCommits = 0;
        for (const week of commitActivity) {
          repoCommits += week.total || 0;
          if (week.total > 0 && week.week) {
            const date = new Date(week.week * 1000);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            activeMonthsSet.add(monthStr);
          }
        }
        if (repoCommits > 0) {
          commitCountsByRepo[repoName] = repoCommits;
          totalCommitsLast12Months += repoCommits;
        }
      }
    } catch (err) {
      console.warn(`Failed to ingest commit stats for repo ${repoName}:`, err);
    }
  }

  // Calculate language weights
  const totalLanguageBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0);
  const languages: Record<string, number> = {};
  if (totalLanguageBytes > 0) {
    for (const [lang, bytes] of Object.entries(languageBytes)) {
      languages[lang] = parseFloat((bytes / totalLanguageBytes).toFixed(4));
    }
  }

  // 4. Fetch PR counts via Search API
  let prsOpened = 0;
  let prsMerged = 0;

  try {
    const openedPrsUrl = `https://api.github.com/search/issues?q=author:${username}+type:pr`;
    const openedPrsKey = `prs_opened:${username}`;
    const openedResult = await fetchWithCache(openedPrsKey, openedPrsUrl, headers);
    prsOpened = openedResult.total_count || 0;
  } catch (err) {
    console.error("Failed to fetch opened PR count:", err);
  }

  try {
    const mergedPrsUrl = `https://api.github.com/search/issues?q=author:${username}+type:pr+is:merged`;
    const mergedPrsKey = `prs_merged:${username}`;
    const mergedResult = await fetchWithCache(mergedPrsKey, mergedPrsUrl, headers);
    prsMerged = mergedResult.total_count || 0;
  } catch (err) {
    console.error("Failed to fetch merged PR count:", err);
  }

  const result: GitHubIngestionResult = {
    repositories,
    languages,
    commits: {
      total_last_12_months: totalCommitsLast12Months,
      by_repository: commitCountsByRepo,
      active_months: Array.from(activeMonthsSet).sort(),
    },
    pull_requests: {
      opened: prsOpened,
      merged: prsMerged,
    },
    top_5_repos_by_stars: top5Repos,
  };

  // 5. Save the aggregated normalized result in candidate_profiles in DB
  if (userId) {
    const { error: dbError } = await adminClient
      .from("candidate_profiles")
      .update({
        github_data: result,
        github_username: username,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (dbError) {
      console.error("Failed to save github_data to candidate_profiles:", dbError);
    } else {
      console.log(`[Ingestion Success] Saved github_data to profile for user_id ${userId}`);
    }
  }

  return result;
}
