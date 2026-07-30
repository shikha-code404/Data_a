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
  console.log("=== Phase 3 End-to-End Correctness Tests ===");

  const CANDIDATE_A = "0ee73e0e-0529-4480-a16c-15748a277bde"; // Has React repos in github_data
  const CANDIDATE_B = "1ee73e0e-0529-4480-a16c-15748a277bdf"; // Python dev, has no React repos in github_data

  // 1. Dual-Candidate Skill Verification check (Item 13)
  console.log("\n--- ITEM 13: Dual-Candidate Skill Verification for skill 'React' ---");
  
  const answersA = [
    "B. To help React identify which items have changed, been added, or removed",
    "C. useEffect",
    "B. Prevents a component from re-rendering if its props have not changed",
    "B. A change in state or props, or a parent re-render",
    "B. It returns a memoized version of a callback that only changes if one of the dependencies changes",
    "B. setState(prevState => prevState + 1)"
  ];

  console.log(`Running React verification for Candidate A (Expected: higher repo_quality_score)...`);
  const svA = await postJSON('/api/verification/run', {
    candidate_id: CANDIDATE_A,
    skill: "React",
    mcq_answers: answersA,
    free_response_answer: "React uses a virtual DOM and a diffing algorithm to perform O(n) updates. Using a key prop helps track list item moves."
  });
  console.log("Candidate A Status:", svA.status);
  console.log("Candidate A Result:", JSON.stringify(svA.body, null, 2));

  console.log(`\nRunning React verification for Candidate B (Expected: 0 repo_quality_score)...`);
  const svB = await postJSON('/api/verification/run', {
    candidate_id: CANDIDATE_B,
    skill: "React",
    mcq_answers: answersA,
    free_response_answer: "React is a UI framework that uses virtual DOM and rendering keys."
  });
  console.log("Candidate B Status:", svB.status);
  console.log("Candidate B Result:", JSON.stringify(svB.body, null, 2));


  // 2. Interview Rating Sensitivity Check (Item 14)
  console.log("\n--- ITEM 14: Interview Rating Sensitivity (Strong vs Weak) ---");

  const questions = [
    "Explain the difference between interface and type in TypeScript, and when to use which.",
    "Explain how React's reconciliation algorithm decides what to re-render.",
    "How does Node.js handle asynchronous operations under the hood?",
    "Tell me about a time you had to optimize performance in a web application.",
    "How do you handle conflict or differing opinions within a development team?"
  ];

  // Strong answer set: detailed answers, technical keywords present, word count > 15 per answer
  const strongAnswers = {
    "Explain the difference between interface and type in TypeScript, and when to use which.":
      "An interface defines object shapes and supports declaration merging (open for extension). A type alias is closed but can represent primitives, unions, intersections, and mapped types. Interfaces are preferred for public API models, whereas type aliases are best for unions and domain logic compositions.",
    "Explain how React's reconciliation algorithm decides what to re-render.":
      "React uses a virtual DOM diffing algorithm with a heuristic O(n) complexity. It identifies elements by type and key. If the element type changes, React destroys the subtree and rebuilds it. For list children, stable and unique keys are used to match previous and next virtual nodes to optimize DOM node reuse and avoid unnecessary re-creation.",
    "How does Node.js handle asynchronous operations under the hood?":
      "Node.js runs on a single-threaded event loop powered by the libuv C++ library. While JS execution is single-threaded, libuv delegates blocking IO operations (file read, network) to the operating system's thread pool or asynchronous network kernels. When done, callbacks are pushed to the event loop's task queue to be executed on the main thread.",
    "Tell me about a time you had to optimize performance in a web application.":
      "I optimized a Next.js dashboard by implementing code-splitting, lazy loading of charts, and database query pooling. This reduced bundle size by 35% and improved first contentful paint by 1.2s.",
    "How do you handle conflict or differing opinions within a development team?":
      "I hold open technical discussions, focus on objective data (benchmarks, complexity, requirements), and align with team standards. If needed, we document alternatives and present to a lead developer for final resolution. "

  };

  // Weak answer set: thin answers, under 15 words per answer, lacking keywords
  const weakAnswers = {
    "Explain the difference between interface and type in TypeScript, and when to use which.":
      "They are basically identical in TypeScript, I just use type.",
    "Explain how React's reconciliation algorithm decides what to re-render.":
      "React compares elements and re-renders if state or props change.",
    "How does Node.js handle asynchronous operations under the hood?":
      "It runs code in the background using promises and callbacks.",
    "Tell me about a time you had to optimize performance in a web application.":
      "I made some slow pages load faster by deleting loops.",
    "How do you handle conflict or differing opinions within a development team?":
      "I just agree with whatever the team lead wants."
  };

  console.log("\nSubmitting STRONG Answers...");
  const resStrong = await postJSON('/api/interview/submit', {
    candidate_id: CANDIDATE_A,
    questions,
    answers: strongAnswers
  });
  console.log("STRONG Status:", resStrong.status);
  console.log("STRONG Result:", JSON.stringify(resStrong.body, null, 2));

  console.log("\nSubmitting WEAK Answers (Expected: capped rating of 40, recommendation 'no')...");
  const resWeak = await postJSON('/api/interview/submit', {
    candidate_id: CANDIDATE_A,
    questions,
    answers: weakAnswers
  });
  console.log("WEAK Status:", resWeak.status);
  console.log("WEAK Result:", JSON.stringify(resWeak.body, null, 2));
}

run().catch(console.error);
