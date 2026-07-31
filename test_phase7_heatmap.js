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
  console.log("=== Phase 7 Campus Talent Heatmap Verification Tests ===");

  // Test 1: GET /api/analytics/heatmap (default campus grouping)
  console.log("\n--- TEST 1: GET /api/analytics/heatmap (Default: Campus) ---");
  const res1 = await getJSON('/api/analytics/heatmap');
  console.log("Status:", res1.status);
  console.log("Response:", JSON.stringify(res1.body, null, 2));

  if (res1.status !== 200 || !Array.isArray(res1.body)) {
    throw new Error(`Test 1 Failed: Expected array response, got status ${res1.status}`);
  }

  for (const item of res1.body) {
    if (!item.location || typeof item.candidate_count !== 'number' || typeof item.average_talent_score !== 'number' || typeof item.average_reputation !== 'number') {
      throw new Error(`Test 1 Failed: Heatmap item missing required fields: ${JSON.stringify(item)}`);
    }
  }
  console.log("Test 1 PASSED! Campus grouping schema validated.");

  // Test 2: GET /api/analytics/heatmap?by=city
  console.log("\n--- TEST 2: GET /api/analytics/heatmap?by=city ---");
  const res2 = await getJSON('/api/analytics/heatmap?by=city');
  console.log("Status:", res2.status);
  console.log("City Groups:", res2.body.map(c => `${c.location}: ${c.candidate_count} candidates (Talent: ${c.average_talent_score}, Rep: ${c.average_reputation})`));

  if (res2.status !== 200 || !Array.isArray(res2.body)) {
    throw new Error(`Test 2 Failed: Expected array response for city grouping`);
  }

  // Definition of Done Assertion: Verify seeded locations like San Francisco, Austin, New York are present
  const cities = res2.body.map(c => c.location);
  if (!cities.some(c => c.includes("San Francisco")) || !cities.some(c => c.includes("Austin")) || !cities.some(c => c.includes("New York"))) {
    throw new Error(`Test 2 Failed: Heatmap did not accurately reflect seeded candidate locations! Found: ${cities.join(", ")}`);
  }
  console.log("Test 2 PASSED! Seeded candidate cities accurately reflected.");

  // Test 3: GET /api/analytics/heatmap?by=department & by=year
  console.log("\n--- TEST 3: GET /api/analytics/heatmap?by=department & by=year ---");
  const res3 = await getJSON('/api/analytics/heatmap?by=department');
  const res4 = await getJSON('/api/analytics/heatmap?by=year');

  if (res3.status !== 200 || res4.status !== 200) {
    throw new Error("Test 3 Failed: Department or Year grouping failed");
  }

  console.log("Departments found:", res3.body.map(d => d.location));
  console.log("Years found:", res4.body.map(y => y.location));
  console.log("Test 3 PASSED! All 4 aggregation dimensions (Campus, City, Department, Year) verified.");

  console.log("\nAll Campus Talent Heatmap tests PASSED successfully!");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
