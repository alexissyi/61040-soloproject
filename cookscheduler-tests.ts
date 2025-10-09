/**
 * CookScheduler Test Cases
 *
 * Demonstrates both manual scheduling and LLM-assisted scheduling
 */

import {
  CookScheduler,
  Availability,
  Preference,
  Assignment,
  User,
} from "./cookscheduler";
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
 * Demonstrates adding cooks, preferences, and availabilities and manually assigning them to time slots
 */
export async function testManualScheduling(): Promise<void> {
  console.log("\n🧪 TEST CASE 1: Manual Scheduling");
  console.log("==================================");

  const scheduler = new CookScheduler();

  const month: number = 9;
  const year: number = 2025;
  scheduler.setMonth(month);
  scheduler.setYear(year);

  console.log("Successfully set month and year");

  const date1: Date = new Date("October 1, 2025");
  const date2: Date = new Date("October 2, 2025");
  scheduler.addCookingDate(date1);
  scheduler.addCookingDate(date2);

  console.log("Successfully added two cooking dates");

  const user1: User = { kerb: "amy1" };
  const user2: User = { kerb: "bob2" };
  scheduler.addCook(user1);
  scheduler.addCook(user2);

  console.log("Successfully added two cooks");
  const availability1: Availability = {
    user: user1,
    dates: new Set([date1, date2]),
  };
  const availability2: Availability = {
    user: user2,
    dates: new Set([date2]),
  };
  const preference1: Preference = {
    user: user1,
    canSolo: true,
    canLead: true,
    canAssist: false,
    maxCookingDays: 2,
  };
  const preference2: Preference = {
    user: user2,
    canSolo: false,
    canLead: true,
    canAssist: true,
    maxCookingDays: 1,
  };
  scheduler.uploadAvailability(availability1);
  scheduler.uploadPreference(preference1);
  scheduler.uploadAvailability(availability2);
  scheduler.uploadPreference(preference2);

  console.log("Successfully uploaded availabilities and preferences");

  scheduler.assignLead(user1, date1);
  scheduler.assignLead(user1, date2);
  scheduler.assignAssistant(user2, date2);

  console.log("Successfully made assignments");
  scheduler.validate(scheduler.getAssignments());
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
