import { createHash } from "crypto";
import { getSupabaseAdmin } from "../db/client";
import { HfInference } from "@huggingface/inference";

// Normalize JSON input recursively by sorting keys
export function normalizeInput(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(normalizeInput);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result: any = {};
  for (const key of sortedKeys) {
    result[key] = normalizeInput(obj[key]);
  }
  return result;
}

// Generate SHA-256 hash of normalized JSON input
export function generateInputHash(input: object): string {
  const normalized = normalizeInput(input);
  const str = JSON.stringify(normalized);
  return createHash("sha256").update(str).digest("hex");
}

// Extract JSON block or object from string
export function extractJSON(text: string): any {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const match = candidate.match(/[\{\[][\s\S]*[\}\]]/);
  if (!match) {
    throw new Error("No JSON object found in model output: " + text);
  }
  return JSON.parse(match[0]);
}

/**
 * Executes an agent call by type.
 * Checks Cache -> Tries Local Ollama -> Falls back to Hugging Face -> Saves Cache -> Returns JSON.
 */
export async function callAgent(agentType: string, input: object): Promise<object> {
  const inputHash = generateInputHash(input);
  const adminClient = getSupabaseAdmin();

  // 1. Check database cache
  try {
    const { data, error } = await adminClient
      .from("agent_responses")
      .select("response")
      .eq("agent_type", agentType)
      .eq("input_hash", inputHash)
      .maybeSingle();

    if (data && data.response) {
      console.log(`[Cache Hit] agentType: ${agentType}, hash: ${inputHash}`);
      return data.response;
    }
  } catch (err) {
    console.error("Database cache read failed. Proceeding to call model directly.", err);
  }

  let responseObj: any = null;
  let source = "";

  // 2. Try Ollama (Local qwen2.5:7b-instruct)
  const ollamaHost = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
  console.log(`[Ollama Request] agentType: ${agentType}, host: ${ollamaHost}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds timeout for local model response

    const res = await fetch(`${ollamaHost}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen2.5:7b-instruct",
        messages: [
          {
            role: "system",
            content: `You are an AI agent of type '${agentType}'. Respond ONLY with a valid JSON object representing your output. Do not include any explanations, markdown code fences, or text outside the JSON.`,
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        stream: false,
        options: {
          temperature: 0.3,
        },
        format: "json", // Ollama format json enforcement
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Ollama responded with status ${res.status}`);
    }

    const data = await res.json();
    const rawContent = data.message?.content;
    if (!rawContent) {
      throw new Error("Ollama returned empty message content");
    }

    responseObj = extractJSON(rawContent);
    source = "ollama";
    console.log(`[Ollama Success] Response parsed successfully.`);
  } catch (ollamaErr: any) {
    console.warn(`Ollama failed or timed out: ${ollamaErr.message}. Falling back to Hugging Face.`);

    // 3. Fallback to Hugging Face Qwen2.5-7B-Instruct
    try {
      const apiKey = process.env.HF_API_KEY;
      const modelId = process.env.HF_MODEL_ID || "Qwen/Qwen2.5-7B-Instruct";
      
      console.log(`[HF Request] modelId: ${modelId}`);
      if (!apiKey || apiKey.includes("placeholder")) {
        throw new Error("Hugging Face API key is missing or is placeholder.");
      }

      const hf = new HfInference(apiKey);
      const completion = await hf.chatCompletion({
        model: modelId,
        messages: [
          {
            role: "system",
            content: `You are an AI agent of type '${agentType}'. Respond ONLY with a valid JSON object. Do not include any explanations, markdown code fences, or text outside the JSON.`,
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      });

      const rawContent = completion.choices[0]?.message?.content ?? "";
      responseObj = extractJSON(rawContent);
      source = "huggingface";
      console.log(`[HF Success] Response parsed successfully.`);
    } catch (hfErr: any) {
      console.error(`Hugging Face fallback also failed: ${hfErr.message}`);
      throw new Error(`All model paths failed. Ollama error: ${ollamaErr.message}. Hugging Face error: ${hfErr.message}`);
    }
  }

  // 4. On success, write result to agent_responses cache
  try {
    console.log(`[Cache Write] Writing response to cache. Hash: ${inputHash}`);
    await adminClient.from("agent_responses").upsert({
      agent_type: agentType,
      input_hash: inputHash,
      input_payload: input,
      response: responseObj,
      created_at: new Date().toISOString(),
    }, {
      onConflict: "agent_type,input_hash"
    });
  } catch (err) {
    console.error("Failed to cache agent response to database:", err);
  }

  return responseObj;
}
