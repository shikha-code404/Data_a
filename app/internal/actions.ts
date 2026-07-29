"use server";

import { callAgent } from "@/lib/agents/callAgent";
import { getSupabaseAdmin } from "@/lib/db/client";

export async function submitAgentTest(agentType: string, inputPayload: string) {
  try {
    let parsedInput: any;
    try {
      parsedInput = JSON.parse(inputPayload);
    } catch (e) {
      throw new Error("Invalid input payload: Please provide a valid JSON string.");
    }

    // Call the agent
    const response = await callAgent(agentType, parsedInput);

    // Fetch matching rows written to agent_responses
    const adminClient = getSupabaseAdmin();
    const { data: cachedRows, error: dbError } = await adminClient
      .from("agent_responses")
      .select("*")
      .eq("agent_type", agentType)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.warn("Could not retrieve cached rows:", dbError.message);
    }

    return {
      success: true,
      response,
      cachedRows: cachedRows || [],
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}
