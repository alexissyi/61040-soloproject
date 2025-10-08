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

  async generateAssignmentsWithLLM(): Promise<void> {}

  private createPrompt(
    preferences: Map<User, Preference>,
    availabilities: Map<User, Availability>,
    cookingDates: Set<Date>,
    existingAssignments: Map<Date, Assignment>
  ): string {
    const prompt =
      "You are a helpful LLM assistant that is helping a household manager assign cooks to a monthly calendar. ";
    return prompt;
  }

  private parseResponse() {}

  validate(): boolean {
    return true;
  }
}
