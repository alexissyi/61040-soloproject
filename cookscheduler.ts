import { GeminiLLM } from "./gemini-llm";
import assert from "assert";

export interface User {
  kerb: string;
}

export interface Assignment {
  lead: User;
  assistant?: User;
  date: Date;
}

export interface Availability {
  user: User;
  dates: Set<Date>;
}

export interface Preference {
  user: User;
  canSolo: boolean;
  canLead: boolean;
  canAssist: boolean;
  maxCookingDays: number;
}

export class CookScheduler {
  private month: number = 0;
  private year: number = 0;
  private cooks: Set<User> = new Set();
  private cookingDates: Set<Date> = new Set();
  private availabilities: Map<User, Availability> = new Map();
  private preferences: Map<User, Preference> = new Map();
  private assignments: Map<Date, Assignment> = new Map();

  addCook(user: User): User {
    this.cooks.forEach((cook) => {
      assert(cook.kerb !== user.kerb);
    });
    this.cooks.add(user);
    return user;
  }

  removeCook(user: User): User {
    assert(this.cooks.has(user));
    this.cooks.delete(user);
    if (this.preferences.has(user)) {
      this.preferences.delete(user);
    }
    if (this.availabilities.has(user)) {
      this.availabilities.delete(user);
    }
    const datesToDelete: Array<Date> = [];
    this.assignments.forEach((assignment, date) => {
      if (assignment.lead.kerb === user.kerb) {
        datesToDelete.push(assignment.date);
      } else if (assignment.assistant?.kerb === user.kerb) {
        assignment.assistant = undefined;
      }
    });
    return user;
  }

  setMonth(month: number): number {
    this.assignments.forEach((assignment) => {
      assert(assignment.date.getMonth() === month);
    });
    this.cookingDates.forEach((date) => {
      assert(date.getMonth() === month);
    });
    this.month = month;
    return this.month;
  }

  setYear(year: number): number {
    this.assignments.forEach((assignment) => {
      assert(assignment.date.getFullYear() === year);
    });
    this.cookingDates.forEach((date) => {
      assert(date.getFullYear() === year);
    });
    this.year = year;
    return this.year;
  }

  addCookingDate(date: Date): Date {
    assert(date.getMonth() === this.month);
    assert(date.getFullYear() === this.year);
    this.cookingDates.add(date);
    return date;
  }

  assignLead(user: User, date: Date) {
    assert(this.cookingDates.has(date));
    assert(this.cooks.has(user));
    assert(this.availabilities.get(user)?.dates.has(date));
    assert(
      this.preferences.get(user)?.canLead === true ||
        this.preferences.get(user)?.canSolo === true
    );
    if (this.assignments.has(date)) {
      const assignment = this.assignments.get(date);
      if (assignment) {
        assignment.lead = user;
      }
    } else {
      const lead = user;
      const assignment: Assignment = {
        lead,
        date,
      };
      this.assignments.set(date, assignment);
    }
  }

  assignAssistant(user: User, date: Date) {
    assert(this.cookingDates.has(date));
    assert(this.cooks.has(user));
    assert(this.availabilities.get(user)?.dates.has(date));
    assert(this.preferences.get(user)?.canAssist === true);
    assert(this.assignments.has(date));

    const assignment = this.assignments.get(date);
    if (assignment) {
      const lead = assignment.lead;
      assert(this.preferences.get(lead)?.canLead === true);
      assignment.assistant = user;
    }
  }

  removeAssignment(date: Date) {
    assert(this.assignments.has(date));
    this.assignments.delete(date);
  }

  private checkPreference(assignment: Assignment, user: User): boolean {
    const preference = this.preferences.get(user);
    if (assignment.lead.kerb === user.kerb) {
      if (assignment.assistant === undefined) {
        if (preference && preference.canSolo === false) {
          return false;
        }
      } else {
        if (preference && preference.canLead === false) {
          return false;
        }
      }
    } else if (
      assignment.assistant &&
      assignment.assistant.kerb === user.kerb
    ) {
      if (preference && preference.canAssist === false) {
        return false;
      }
    }
    return true;
  }
  private checkAvailability(assignment: Assignment, user: User): boolean {
    const availability = this.availabilities.get(user);
    const date = assignment.date;
    if (
      availability &&
      (assignment.lead.kerb === user.kerb ||
        assignment.assistant?.kerb === user.kerb) &&
      !availability.dates.has(date)
    ) {
      return false;
    }
    return true;
  }

  uploadPreference(preference: Preference) {
    const user = preference.user;
    assert(this.cooks.has(user));
    this.preferences.set(user, preference);

    const datesToDelete: Array<Date> = [];
    const allDates: Array<Date> = [];
    let totalAssignments = 0;
    this.assignments.forEach((assignment, date) => {
      if (
        assignment.lead.kerb === user.kerb ||
        assignment.assistant?.kerb === user.kerb
      ) {
        totalAssignments += 1;
        allDates.push(date);
        if (this.checkPreference(assignment, user)) {
          datesToDelete.push(date);
        }
      }
    });
    datesToDelete.forEach((date) => {
      this.assignments.delete(date);
    });
    preference && totalAssignments > preference.maxCookingDays;
    const extraDays = totalAssignments - preference.maxCookingDays;
    for (let i = 1; i <= extraDays; i++) {
      this.assignments.delete(allDates[-i]);
    }
  }

  uploadAvailability(availability: Availability) {
    const user = availability.user;
    assert(this.cooks.has(user));
    this.availabilities.set(user, availability);

    const datesToDelete: Array<Date> = [];

    this.assignments.forEach((assignment, date) => {
      if (
        assignment.lead.kerb === user.kerb ||
        assignment.assistant?.kerb === user.kerb
      ) {
        if (!this.checkAvailability(assignment, user)) {
          datesToDelete.push(date);
        }
      }
    });

    datesToDelete.forEach((date) => {
      this.assignments.delete(date);
    });
  }

  async generateAssignments(): Promise<void> {}

  async generateAssignmentsWithLLM(llm: GeminiLLM): Promise<void> {
    try {
      const prompt = this.createPrompt();
      const text = await llm.executeLLM(prompt);

      console.log("✅ Received response from Gemini AI!");
      console.log("\n🤖 RAW GEMINI RESPONSE");
      console.log("======================");
      console.log(text);
      console.log("======================\n");

      // Parse and apply the assignments
      this.parseAndApplyAssignments(text);
    } catch (error) {
      console.error("❌ Error calling Gemini API:", (error as Error).message);
      throw error;
    }
  }

  private createPrompt(): string {
    let preferencesSection = "";
    this.preferences.forEach((preference, user) => {
      preferencesSection +=
        user.kerb +
        ": " +
        `{ canSolo: ${preference.canSolo}, canLead: ${preference.canLead}, canAssist: ${preference.canAssist}, maxCookingDays: ${preference.maxCookingDays}`;
      preferencesSection += "\n";
    });
    let availabilitiesSection = "";
    this.availabilities.forEach((availability, user) => {
      availabilitiesSection += user.kerb + ": " + `{ ${availability}}`;
      availabilitiesSection += "\n";
    });

    let criticalRequirements = `
    1. No user should be assigned to a date that is not in their available dates.
    2. No user should be a lead cook without an assistant if they did not say that they can cook solo.
    3. No user should be a lead cook with an assistant if they did not say they can be the lead cook with an assistant.
    4. No user should be an assistant cook if they did not say they can be an assistant cook.
    5. Any proposed calendar should fill as many dates as possible without violating any of the previous requirements.
    6. Any proposed calendar should abide by previously made assignments.
    7. No date should have an assistant cook but no lead cook.`;

    const prompt = `You are a helpful LLM assistant that is helping a household manager assign users to a monthly calendar for the month of ${this.month}, ${this.year}. 
    
    Each user has a set of dates they are available. 
    
    Each user also has a set of preferences that specify:
    1) canSolo: whether they are willing to cook solo (in which case they are a lead cook without an assistant); 
    2) canLead: whether they are willing to be lead cook in a pair of cooks and 3) whether they are willing to be an assistant cook in a pair of cooks. 
    3) canAssist: whether they are willing to be an assistant cook in a pair of cooks
    4) maxCookingDays: maximum number of days they are willing to cook for the month.
    
    Here are the preferences for each user:
    
    ${preferencesSection}
    
    Here are the availabilities for each user:
    
    ${availabilitiesSection}
    
    These are the cooking dates: ${this.cookingDates}. For each date, we want a lead cook, and optionally an assistant cook.

    Finally, here are some existing assignments that need to be preserved: ${this.assignments}.

    Create a proposed calendar assigning users to be either lead or assistant cook for each date, with these critical requirements:

    ${criticalRequirements}

    Return your response as a JSON object with this exact structure:
    {
    "assignments": [
        {
        "date": "a date in Date format"
        "lead": "user name",
        "assistant": "user name"
        }
    ]
    }

    Return ONLY the JSON object, no additional text.`;

    return prompt;
  }

  private parseAndApplyAssignments(responseText: String): void {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const response = JSON.parse(jsonMatch[0]);

      if (!response.assignments || !Array.isArray(response.assignments)) {
        throw new Error("Invalid response format");
      }

      const assignments: Array<Assignment> = response.assignments;

      this.validate(assignments);

      console.log("📝 Applying LLM assignments...");

      assignments.forEach((assignment) => {
        this.assignments.set(assignment.date, assignment);
      });
    } catch (error) {
      console.error("❌ Error parsing LLM response:", (error as Error).message);
      console.log("Response was:", responseText);
      throw error;
    }
  }

  getAssignments(): Map<Date, Assignment> {
    const assignmentsCopy: Map<Date, Assignment> = new Map();
    this.assignments.forEach((assignment, date) => {
      const lead = assignment.lead;
      const assistant = assignment.assistant;
      const assignmentCopy: Assignment = {
        date,
        lead,
        assistant,
      };
      assignmentsCopy.set(date, assignmentCopy);
    });
    return assignmentsCopy;
  }

  validate(assignments: Array<Assignment>): boolean {
    const totalDays: Map<User, number> = new Map();
    assignments.forEach((assignment) => {
      const lead = assignment.lead;
      let leadDays = totalDays.get(lead);
      if (!leadDays) {
        leadDays = 0;
      }
      totalDays.set(lead, leadDays + 1);
      assert(this.checkPreference(assignment, lead));
      assert(this.checkAvailability(assignment, lead));
      const assistant = assignment.assistant;
      if (assistant) {
        assert(this.checkPreference(assignment, assistant));
        assert(this.checkAvailability(assignment, assistant));
        let assistDays = totalDays.get(assistant);
        if (!assistDays) {
          assistDays = 0;
        }
        totalDays.set(assistant, assistDays + 1);
      }
    });
    totalDays.forEach((days, user) => {
      const maxDays = this.preferences.get(user)?.maxCookingDays;
      if (maxDays !== undefined) {
        assert(maxDays >= days);
      }
    });
    return true;
  }
}
