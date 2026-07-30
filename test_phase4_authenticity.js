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
  console.log("=== Phase 4 Authenticity Score Endpoint Tests ===");
  const CANDIDATE_A = "0ee73e0e-0529-4480-a16c-15748a277bde";

  // Test 1: Compute fresh score
  console.log("\n--- TEST 1: Compute fresh Authenticity Score ---");
  const res1 = await postJSON('/api/authenticity/score', {
    candidate_id: CANDIDATE_A,
    force_fresh: true
  });
  console.log("Status:", res1.status);
  console.log("Response:", JSON.stringify(res1.body, null, 2));

  if (res1.status !== 200) {
    throw new Error("Test 1 Failed: Status is not 200");
  }
  const report1 = res1.body;
  if (!report1.candidate_id || typeof report1.authenticity_score !== 'number' || !report1.risk_level || !Array.isArray(report1.flags) || !report1.generated_at) {
    throw new Error("Test 1 Failed: Response missing required fields");
  }
  console.log("Test 1 PASSED!");

  // Test 2: Read from cache (should reuse result < 24h old)
  console.log("\n--- TEST 2: Cache Reuse Check (force_fresh: false) ---");
  const res2 = await postJSON('/api/authenticity/score', {
    candidate_id: CANDIDATE_A,
    force_fresh: false
  });
  console.log("Status:", res2.status);
  console.log("Response:", JSON.stringify(res2.body, null, 2));

  if (res2.status !== 200) {
    throw new Error("Test 2 Failed: Status is not 200");
  }
  if (res2.body.generated_at !== report1.generated_at) {
    throw new Error("Test 2 Failed: Timestamp changed; cache was not reused!");
  }
  console.log("Test 2 PASSED! Cache successfully reused.");

  // Test 3: Force fresh compute
  console.log("\n--- TEST 3: Force Fresh Compute (force_fresh: true) ---");
  // Wait 1.5 seconds to ensure timestamp is different
  await new Promise(r => setTimeout(r, 1500));
  const res3 = await postJSON('/api/authenticity/score', {
    candidate_id: CANDIDATE_A,
    force_fresh: true
  });
  console.log("Status:", res3.status);
  console.log("Response generated_at:", res3.body.generated_at);

  if (res3.status !== 200) {
    throw new Error("Test 3 Failed: Status is not 200");
  }
  if (res3.body.generated_at === report1.generated_at) {
    throw new Error("Test 3 Failed: Timestamp did not change despite force_fresh: true!");
  }
  console.log("Test 3 PASSED! Fresh compute forced successfully.");
  console.log("\nAll Authenticity Score tests PASSED successfully!");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
