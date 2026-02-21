export interface ShoppingItem {
  id: string;
  name: string;
  category: "Groceries" | "Stationery" | "Household" | "Personal";
  quantity: string;
  notes: string;
  purchased: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: "Breakfast" | "Lunch" | "Dinner" | "Snacks";
  ingredients: string[];
  steps: string[];
  notes: string;
  createdAt: string;
}

export interface WeeklyTask {
  id: string;
  day: string;
  task: string;
  completed: boolean;
}

export interface MonthlyEvent {
  id: string;
  month: string;
  year: number;
  title: string;
  date: string;
  notes: string;
  type: "goal" | "reminder" | "event";
}

export interface YearlyEvent {
  id: string;
  year: number;
  title: string;
  month: string;
  description: string;
  type: "goal" | "exam" | "family" | "project" | "other";
}

export const EXPENSE_CATEGORIES = [
  "Food",
  "Travel",
  "Education",
  "Medical",
  "Utilities",
  "Miscellaneous",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Other",
] as const;

export const SHOPPING_CATEGORIES = [
  "Groceries",
  "Stationery",
  "Household",
  "Personal",
] as const;

export const RECIPE_CATEGORIES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
] as const;

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
