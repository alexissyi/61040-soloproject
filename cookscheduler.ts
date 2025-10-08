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

  uploadPreference(preference: Preference) {
    const user = preference.user;
    assert(this.cooks.has(user));
    this.preferences.set(user, preference);
  }

  uploadAvailability(availability: Availability) {
    const user = availability.user;
    assert(this.cooks.has(user));
    this.availabilities.set(user, availability);
  }

  async generateAssignments(): Promise<void> {}

  async generateAssignmentsWithLLM(): Promise<void> {}

  validate(): boolean {
    return true;
  }
}
