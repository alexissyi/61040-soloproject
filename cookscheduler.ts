import { GeminiLLM } from "./gemini-llm";

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
  private cooks: Set<User> = new Set();
  private cookingDates: Set<Date> = new Set();
  private availabilities: Set<Availability> = new Set();
  private preferences: Set<Preference> = new Set();
  private assignments: Set<Assignment> = new Set();
}
