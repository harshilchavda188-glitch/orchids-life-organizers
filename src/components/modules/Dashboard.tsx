"use client";

import {
  ShoppingCart,
  Wallet,
  ChefHat,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface DashboardProps {
  onNavigate: (tab: string) => void;
  userName?: string;
  onSignOut?: () => void;
}

const modules = [
  {
    id: "shopping",
    title: "Shopping List",
    description: "Manage groceries & household items",
    icon: ShoppingCart,
    color: "bg-[#e8ddd0] text-[#7c6f64]",
  },
  {
    id: "budget",
    title: "Budget & Expenses",
    description: "Track income & monthly summaries",
    icon: Wallet,
    color: "bg-[#d4e8d0] text-[#5c7c56]",
  },
  {
    id: "recipes",
    title: "Recipe Manager",
    description: "Save & organize favourite recipes",
    icon: ChefHat,
    color: "bg-[#e8d6c4] text-[#8a6f50]",
  },
  {
    id: "weekly",
    title: "Weekly Planner",
    description: "Plan tasks for each day",
    icon: CalendarDays,
    color: "bg-[#c8d8e8] text-[#4a6a8a]",
  },
  {
    id: "monthly",
    title: "Monthly Planner",
    description: "Set monthly goals & events",
    icon: CalendarRange,
    color: "bg-[#d8d0e8] text-[#6a5c8a]",
  },
  {
    id: "yearly",
    title: "Yearly Planner",
    description: "Annual goals & family events",
    icon: CalendarClock,
    color: "bg-[#e8d0d0] text-[#8a5c5c]",
  },
];

export default function Dashboard({ onNavigate, userName, onSignOut }: DashboardProps) {
  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good Morning"
      : now.getHours() < 17
      ? "Good Afternoon"
      : "Good Evening";

  const displayName = userName || "there";

  return (
    <div className="min-h-screen bg-[#faf8f5] px-5 pt-6 pb-4">
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2d2a26]">
                <svg viewBox="0 0 40 40" className="h-4 w-4" fill="none">
                  <path d="M20 4L36 14V26L20 36L4 26V14L20 4Z" fill="white" fillOpacity="0.1"/>
                  <path d="M20 8L32 16V24L20 32L8 24V16L20 8Z" fill="white" fillOpacity="0.25"/>
                  <path d="M20 12L28 18V22L20 28L12 22V18L20 12Z" fill="white"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#2d2a26]">
                Smart Life
              </h1>
            </div>
            <p className="text-sm text-[#8a8178]">
              {greeting}, <span className="text-[#2d2a26] font-medium">{displayName}</span>
            </p>
          </div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 rounded-xl border border-[#e4ddd4] bg-white px-3 py-2 text-xs font-medium text-[#8a8178] transition-colors hover:bg-[#f0ebe4] hover:text-[#5c554d] active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          )}
        </div>

        {/* Date Card */}
        <div className="mb-6 rounded-2xl border border-[#e4ddd4] bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#b5aca3]">Today</p>
              <p className="mt-1 text-lg font-semibold text-[#2d2a26]">
                {now.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-[#e4ddd4] bg-[#faf8f5] px-3 py-1.5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                <rect width="24" height="24" rx="6" fill="#2d2a26"/>
                <path d="M12 5.5C12.5 5.5 13 5.8 13.3 6.3L18.5 15.5C19 16.3 18.4 17.5 17.5 17.5H6.5C5.6 17.5 5 16.3 5.5 15.5L10.7 6.3C11 5.8 11.5 5.5 12 5.5Z" fill="white"/>
              </svg>
              <span className="text-[10px] font-medium text-[#8a8178]">Expo App</span>
            </div>
          </div>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => onNavigate(mod.id)}
                className="group flex items-center gap-4 rounded-2xl border border-[#e4ddd4] bg-white p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${mod.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-semibold leading-tight text-[#2d2a26]">
                    {mod.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#8a8178] leading-snug">
                    {mod.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#b5aca3] transition-transform group-hover:translate-x-0.5 group-hover:text-[#8a8178]" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
