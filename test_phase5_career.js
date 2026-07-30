const http = require('http');

function postJSON(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
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
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log("=== Phase 5 Career Guidance System Endpoint Tests ===");
  const CANDIDATE_A = "0ee73e0e-0529-4480-a16c-15748a277bde";

  console.log("\n--- TEST 1: Retrieve Career Guidance for Candidate A ---");
  const res1 = await postJSON('/api/career/guidance', {
    candidate_id: CANDIDATE_A,
    force_fresh: true
  });

  console.log("Status:", res1.status);
  console.log("Response:", JSON.stringify(res1.body, null, 2));

  if (res1.status !== 200) {
    throw new Error(`Test 1 Failed: Status is ${res1.status}`);
  }

  const report = res1.body;
  if (!report.success) {
    throw new Error("Test 1 Failed: API returned success=false");
  }

  if (!report.career_roadmap || !report.salary_estimate) {
    throw new Error("Test 1 Failed: Missing career_roadmap or salary_estimate in response");
  }

  // Schema checks
  const { skill_gaps, recommended_certifications, career_roadmap, reasoning } = report.career_roadmap;
  if (!Array.isArray(skill_gaps) || !Array.isArray(recommended_certifications) || !Array.isArray(career_roadmap) || typeof reasoning !== 'string') {
    throw new Error("Test 1 Failed: career_roadmap schema fields are invalid");
  }

  console.log("Roadmap checks: OK");

  // Salary estimate checks
  const { estimated_range, basis } = report.salary_estimate;
  if (!estimated_range || typeof estimated_range.min !== 'number' || typeof estimated_range.max !== 'number' || typeof estimated_range.currency !== 'string') {
    throw new Error("Test 1 Failed: salary_estimate range is invalid");
  }

  if (!basis || !basis.includes("ESTIMATE ONLY") || !basis.includes("heuristic")) {
    throw new Error("Test 1 Failed: basis field must explicitly highlight heuristic nature");
  }

  console.log("Salary estimate checks: OK");
  console.log("\nAll Career Guidance System tests PASSED successfully!");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
