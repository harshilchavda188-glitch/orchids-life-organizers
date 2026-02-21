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
  const [activeTab, setActiveTab] = useState<Tab>("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard onNavigate={setActiveTab} />;
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
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 overflow-y-auto pb-20">{renderContent()}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm safe-bottom">
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
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
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
