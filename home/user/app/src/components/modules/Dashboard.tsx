"use client";

import {
  ShoppingCart,
  Wallet,
  ChefHat,
  CalendarDays,
  CalendarRange,
  CalendarClock,
} from "lucide-react";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const modules = [
  {
    id: "shopping",
    title: "Shopping List",
    description: "Manage groceries, stationery & household items",
    icon: ShoppingCart,
    color: "bg-rose-50 text-rose-600 border-rose-100",
    iconBg: "bg-rose-100",
  },
  {
    id: "budget",
    title: "Budget & Expenses",
    description: "Track income, expenses & monthly summaries",
    icon: Wallet,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    iconBg: "bg-emerald-100",
  },
  {
    id: "recipes",
    title: "Recipe Manager",
    description: "Save & organize your favourite recipes",
    icon: ChefHat,
    color: "bg-amber-50 text-amber-600 border-amber-100",
    iconBg: "bg-amber-100",
  },
  {
    id: "weekly",
    title: "Weekly Planner",
    description: "Plan tasks for each day of the week",
    icon: CalendarDays,
    color: "bg-sky-50 text-sky-600 border-sky-100",
    iconBg: "bg-sky-100",
  },
  {
    id: "monthly",
    title: "Monthly Planner",
    description: "Set monthly goals, reminders & events",
    icon: CalendarRange,
    color: "bg-violet-50 text-violet-600 border-violet-100",
    iconBg: "bg-violet-100",
  },
  {
    id: "yearly",
    title: "Yearly Planner",
    description: "Annual goals, exams, family events & projects",
    icon: CalendarClock,
    color: "bg-orange-50 text-orange-600 border-orange-100",
    iconBg: "bg-orange-100",
  },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good Morning"
      : now.getHours() < 17
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <div className="px-5 pt-6 pb-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          LifeBoard
        </h1>
        <p className="mt-1 text-base text-muted-foreground">{greeting}! What would you like to manage today?</p>
      </div>

      {/* Quick Date Display */}
      <div className="mb-6 rounded-2xl bg-primary/5 border border-primary/10 px-5 py-4">
        <p className="text-sm font-medium text-muted-foreground">Today</p>
        <p className="text-lg font-semibold text-foreground">
          {now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.98] ${mod.color}`}
            >
              <div className={`rounded-xl p-2.5 ${mod.iconBg}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold leading-tight">
                  {mod.title}
                </h3>
                <p className="mt-1 text-sm opacity-75 leading-snug">
                  {mod.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
