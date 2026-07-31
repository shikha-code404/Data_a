const http = require('http');

function getJSON(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function run() {
  console.log("=== Phase 7 Community Reputation Score Verification Tests ===");
  const CANDIDATE_A = "0ee73e0e-0529-4480-a16c-15748a277bde";
  const CANDIDATE_B = "1ee73e0e-0529-4480-a16c-15748a277bdf";

  // Test 1: Fetch Candidate A Community Score via API Endpoint
  console.log("\n--- TEST 1: GET /api/community-score/:candidateId for Candidate A ---");
  const res1 = await getJSON(`/api/community-score/${CANDIDATE_A}?force_fresh=true`);
  console.log("Status:", res1.status);
  console.log("Response:", JSON.stringify(res1.body, null, 2));

  if (res1.status !== 200) {
    throw new Error(`Test 1 Failed: Status is ${res1.status}`);
  }

  const { community_score, breakdown, reasoning } = res1.body;
  if (typeof community_score !== 'number' || !breakdown || typeof reasoning !== 'string') {
    throw new Error("Test 1 Failed: Response missing community_score, breakdown, or reasoning");
  }

  if (typeof breakdown.github !== 'number' || typeof breakdown.pull_requests !== 'number' || typeof breakdown.hackathons !== 'number' || typeof breakdown.verified_skills !== 'number') {
    throw new Error("Test 1 Failed: Breakdown schema fields are invalid");
  }

  console.log("Test 1 PASSED! Candidate A score schema validated.");

  // Test 2: Fetch Candidate B (Junior/Python candidate with lower GitHub & Hackathon data)
  console.log("\n--- TEST 2: GET /api/community-score/:candidateId for Candidate B ---");
  const res2 = await getJSON(`/api/community-score/${CANDIDATE_B}?force_fresh=true`);
  console.log("Status:", res2.status);
  console.log("Candidate B Score:", res2.body.community_score, "Breakdown:", res2.body.breakdown);

  if (res2.status !== 200) {
    throw new Error(`Test 2 Failed: Status is ${res2.status}`);
  }

  // Definition of Done Assertion: Candidate A (with 163 commits, merged PRs, hackathon awards) must have a higher reputation score than Candidate B (45 commits, no hackathons)
  if (res1.body.community_score <= res2.body.community_score) {
    throw new Error(`Test 2 Failed: Candidate A score (${res1.body.community_score}) was not higher than Candidate B score (${res2.body.community_score})!`);
  }

  if (res1.body.breakdown.github <= res2.body.breakdown.github) {
    throw new Error("Test 2 Failed: GitHub contribution sub-score did not reflect data differences!");
  }

  console.log("Test 2 PASSED! Data differences in GitHub and Hackathon participation correctly updated community reputation scores.");
  console.log("\nAll Community Reputation Score tests PASSED successfully!");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
