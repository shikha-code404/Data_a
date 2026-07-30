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

function getHTML(path) {
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
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function run() {
  console.log("=== Phase 5 Resume Generation System Endpoint Tests ===");
  const CANDIDATE_A = "0ee73e0e-0529-4480-a16c-15748a277bde";

  // Test 1: Generate Modern Resume
  console.log("\n--- TEST 1: Generate Modern Resume ---");
  const res1 = await postJSON('/api/resume/generate', {
    candidate_id: CANDIDATE_A,
    template: 'Modern',
    force_fresh: true
  });

  console.log("Status:", res1.status);
  if (res1.status !== 200) {
    console.error("Raw response:", res1.raw || res1.body);
    throw new Error(`Test 1 Failed: Status is ${res1.status}`);
  }
  console.log("Response Keys:", Object.keys(res1.body || {}));

  const result = res1.body;
  if (!result.success || !result.resume_id || !result.resume_json) {
    throw new Error("Test 1 Failed: Missing success flag, resume_id, or resume_json");
  }

  // Schema Validation
  const resume = result.resume_json;
  if (!resume.name || !resume.contact || !resume.summary || !Array.isArray(resume.experience) || !Array.isArray(resume.education) || !Array.isArray(resume.projects) || !Array.isArray(resume.skills) || !Array.isArray(resume.certifications)) {
    throw new Error("Test 1 Failed: Structured resume fields are invalid or missing");
  }

  console.log("Resume Schema validated successfully!");
  console.log("Candidate Name parsed:", resume.name);
  console.log("Number of Experience items:", resume.experience.length);
  console.log("Number of Projects:", resume.projects.length);

  // Test 2: Fetch and verify Download Page
  console.log("\n--- TEST 2: Fetch Resume Download HTML Page ---");
  const downloadPath = `/api/resume/${result.resume_id}/download`;
  console.log("Requesting download page at path:", downloadPath);

  const res2 = await getHTML(downloadPath);
  console.log("Status:", res2.status);
  
  if (res2.status !== 200) {
    throw new Error(`Test 2 Failed: Status is ${res2.status}`);
  }

  if (!res2.body.includes("Print Preview") || !res2.body.includes("window.print()") || !res2.body.includes(resume.name)) {
    throw new Error("Test 2 Failed: HTML page content is missing print helper or candidate details");
  }

  console.log("Download HTML Page verified successfully!");
  console.log("\nAll Resume Generation System tests PASSED successfully!");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
