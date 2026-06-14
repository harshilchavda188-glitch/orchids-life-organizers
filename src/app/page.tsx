"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Wallet,
  ChefHat,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  Home,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import AuthScreen from "@/components/AuthScreen";
import Dashboard from "@/components/modules/Dashboard";
import ShoppingList from "@/components/modules/ShoppingList";
import BudgetExpense from "@/components/modules/BudgetExpense";
import RecipeManager from "@/components/modules/RecipeManager";
import WeeklyPlanner from "@/components/modules/WeeklyPlanner";
import MonthlyPlanner from "@/components/modules/MonthlyPlanner";
import YearlyPlanner from "@/components/modules/YearlyPlanner";

type Tab =
  | "home"
  | "shopping"
  | "budget"
  | "recipes"
  | "weekly"
  | "monthly"
  | "yearly";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "shopping", label: "Shopping", icon: ShoppingCart },
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "recipes", label: "Recipes", icon: ChefHat },
  { id: "weekly", label: "Weekly", icon: CalendarDays },
  { id: "monthly", label: "Monthly", icon: CalendarRange },
  { id: "yearly", label: "Yearly", icon: CalendarClock },
];

export default function App() {
  const { user, isLoaded, signIn, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("home");

  // Show nothing while checking auth state
    if (!isLoaded) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2d2a26]">
              <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none">
                <path d="M20 4L36 14V26L20 36L4 26V14L20 4Z" fill="white" fillOpacity="0.1"/>
                <path d="M20 8L32 16V24L20 32L8 24V16L20 8Z" fill="white" fillOpacity="0.25"/>
                <path d="M20 12L28 18V22L20 28L12 22V18L20 12Z" fill="white"/>
              </svg>
            </div>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e4ddd4] border-t-[#7c6f64]" />
          </div>
        </div>
      );
    }

  // Show auth screen if not logged in
  if (!user) {
    return <AuthScreen onAuth={signIn} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <Dashboard
            onNavigate={(tab) => setActiveTab(tab as Tab)}
            userName={user.name}
            onSignOut={signOut}
          />
        );
      case "shopping":
        return <ShoppingList />;
      case "budget":
        return <BudgetExpense />;
      case "recipes":
        return <RecipeManager />;
      case "weekly":
        return <WeeklyPlanner />;
      case "monthly":
        return <MonthlyPlanner />;
      case "yearly":
        return <YearlyPlanner />;
    }
  };

    return (
      <div className="flex min-h-screen flex-col bg-[#faf8f5]">
        <main className="flex-1 overflow-y-auto pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">{renderContent()}</div>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e4ddd4] bg-white/95 backdrop-blur-sm safe-bottom">
          <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition-all ${
                    isActive
                      ? "bg-[#f0ebe4] text-[#2d2a26]"
                      : "text-[#b5aca3] hover:text-[#8a8178]"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                  <span
                    className={`text-[10px] leading-tight truncate ${
                      isActive ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    );
}
