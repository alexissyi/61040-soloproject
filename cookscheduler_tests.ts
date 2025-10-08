/**
 * DayPlanner Test Cases
 *
 * Demonstrates both manual scheduling and LLM-assisted scheduling
 */

import { CookScheduler } from "./cookscheduler";
import { GeminiLLM, Config } from "./gemini-llm";

/**
 * Load configuration from config.json
 */
function loadConfig(): Config {
  try {
    const config = require("../config.json");
    return config;
  } catch (error) {
    console.error(
      "❌ Error loading config.json. Please ensure it exists with your API key."
    );
    console.error("Error details:", (error as Error).message);
    process.exit(1);
  }
}

/**
 * Test case 1: Manual scheduling
 * Demonstrates adding activities and manually assigning them to time slots
 */
export async function testManualScheduling(): Promise<void> {
  console.log("\n🧪 TEST CASE 1: Manual Scheduling");
  console.log("==================================");

  const planner = new CookScheduler();
}

/**
 * Test case 2: LLM-assisted scheduling
 * Demonstrates adding activities and letting the LLM assign them automatically
 */
export async function testLLMScheduling(): Promise<void> {
  console.log("\n🧪 TEST CASE 2: LLM-Assisted Scheduling");
  console.log("========================================");

  const planner = new CookScheduler();
  const config = loadConfig();
  const llm = new GeminiLLM(config);
}

/**
 * Test case 3: Mixed scheduling
 * Demonstrates adding some activities manually and others via LLM
 */
export async function testMixedScheduling(): Promise<void> {
  console.log("\n🧪 TEST CASE 3: Mixed Scheduling");
  console.log("=================================");

  const planner = new CookScheduler();
  const config = loadConfig();
  const llm = new GeminiLLM(config);
}

/**
 * Main function to run all test cases
 */
async function main(): Promise<void> {
  console.log("🎓 DayPlanner Test Suite");
  console.log("========================\n");

  try {
    // Run manual scheduling test
    await testManualScheduling();

    // Run LLM scheduling test
    await testLLMScheduling();

    // Run mixed scheduling test
    await testMixedScheduling();

    console.log("\n🎉 All test cases completed successfully!");
  } catch (error) {
    console.error("❌ Test error:", (error as Error).message);
    process.exit(1);
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  main();
}
