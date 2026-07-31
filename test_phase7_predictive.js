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
  console.log("=== Phase 7 Predictive Hiring Analytics Verification Tests ===");

  // Test 1: GET /api/recruiter/analytics
  console.log("\n--- TEST 1: GET /api/recruiter/analytics ---");
  const res1 = await getJSON('/api/recruiter/analytics');
  console.log("Status:", res1.status);
  console.log("Response Keys:", Object.keys(res1.body));

  if (res1.status !== 200) {
    throw new Error(`Test 1 Failed: Expected status 200, got ${res1.status}`);
  }

  const {
    recommended_interview_candidates,
    highest_growth_candidates,
    top_verified_candidates,
    high_risk_candidates,
    team_statistics
  } = res1.body;

  if (!Array.isArray(recommended_interview_candidates) ||
      !Array.isArray(highest_growth_candidates) ||
      !Array.isArray(top_verified_candidates) ||
      !Array.isArray(high_risk_candidates) ||
      !team_statistics) {
    throw new Error("Test 1 Failed: Missing required predictive analytics sections!");
  }

  console.log("Recommended candidates count:", recommended_interview_candidates.length);
  console.log("Highest growth candidates count:", highest_growth_candidates.length);
  console.log("Top verified candidates count:", top_verified_candidates.length);
  console.log("High risk candidates count:", high_risk_candidates.length);
  console.log("Team Statistics:", JSON.stringify(team_statistics, null, 2));

  // Test 2: Verify team_statistics metrics
  console.log("\n--- TEST 2: Validate team_statistics fields ---");
  const { hiring_funnel, average_talent_score, average_match_percentage, fraud_distribution, interview_conversion_rate } = team_statistics;

  if (typeof hiring_funnel?.total_candidates !== 'number' ||
      typeof hiring_funnel?.screened !== 'number' ||
      typeof hiring_funnel?.interviewed !== 'number' ||
      typeof hiring_funnel?.verified !== 'number' ||
      typeof hiring_funnel?.offer_ready !== 'number') {
    throw new Error("Test 2 Failed: hiring_funnel missing required metrics");
  }

  if (typeof average_talent_score !== 'number' || typeof average_match_percentage !== 'number') {
    throw new Error("Test 2 Failed: Average score metrics missing");
  }

  if (typeof fraud_distribution?.low_risk !== 'number' || typeof fraud_distribution?.medium_risk !== 'number' || typeof fraud_distribution?.high_risk !== 'number') {
    throw new Error("Test 2 Failed: fraud_distribution metrics missing");
  }

  if (typeof interview_conversion_rate !== 'number') {
    throw new Error("Test 2 Failed: interview_conversion_rate missing");
  }

  console.log("Test 2 PASSED! All recruiter team statistics metrics validated.");
  console.log("\nAll Predictive Hiring Analytics tests PASSED successfully!");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
