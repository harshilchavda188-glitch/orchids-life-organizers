"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Check, X, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import {
  Transaction,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  generateId,
  formatINR,
} from "@/lib/types";
import { toast } from "sonner";

export default function BudgetExpense() {
  const [transactions, setTransactions, isLoaded] = useLocalStorage<Transaction[]>(
    "transactions",
    []
  );
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  // Form state
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const resetForm = () => {
    setType("expense");
    setAmount("");
    setCategory("Food");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    const newTxn: Transaction = {
      id: generateId(),
      type,
      amount: Number(amount),
      category,
      description: description.trim(),
      date,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTxn, ...prev]);
    toast.success(`${type === "income" ? "Income" : "Expense"} added`);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setDeleteConfirm(null);
    toast.success("Transaction removed");
  };

  // Monthly summary
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = useMemo(
    () =>
      transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }),
    [transactions, currentMonth, currentYear]
  );

  const totalIncome = useMemo(
    () =>
      monthlyTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [monthlyTransactions]
  );

  const totalExpense = useMemo(
    () =>
      monthlyTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [monthlyTransactions]
  );

  const balance = totalIncome - totalExpense;

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthlyTransactions]);

  const filtered =
    filterType === "all"
      ? transactions
      : transactions.filter((t) => t.type === filterType);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  if (!isLoaded) return null;

  return (
    <div className="px-5 pt-6 pb-4">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Budget & Expenses</h1>
          <p className="text-sm text-muted-foreground">
            {now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-center">
          <TrendingUp className="mx-auto mb-1 h-5 w-5 text-emerald-600" />
          <p className="text-xs text-emerald-600 font-medium">Income</p>
          <p className="text-sm font-bold text-emerald-700 truncate">{formatINR(totalIncome)}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-center">
          <TrendingDown className="mx-auto mb-1 h-5 w-5 text-rose-600" />
          <p className="text-xs text-rose-600 font-medium">Expenses</p>
          <p className="text-sm font-bold text-rose-700 truncate">{formatINR(totalExpense)}</p>
        </div>
        <div className={`rounded-2xl border p-3 text-center ${balance >= 0 ? "border-sky-100 bg-sky-50" : "border-orange-100 bg-orange-50"}`}>
          <Wallet className={`mx-auto mb-1 h-5 w-5 ${balance >= 0 ? "text-sky-600" : "text-orange-600"}`} />
          <p className={`text-xs font-medium ${balance >= 0 ? "text-sky-600" : "text-orange-600"}`}>Balance</p>
          <p className={`text-sm font-bold truncate ${balance >= 0 ? "text-sky-700" : "text-orange-700"}`}>{formatINR(balance)}</p>
        </div>
      </div>

      {/* Expense Breakdown */}
      {expenseByCategory.length > 0 && (
        <div className="mb-5 rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Expense Breakdown</h3>
          <div className="space-y-2">
            {expenseByCategory.map(([cat, amt]) => {
              const pct = totalExpense > 0 ? (amt / totalExpense) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{cat}</span>
                    <span className="text-muted-foreground">{formatINR(amt)}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary/70 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold">Add Transaction</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              {(["income", "expense"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setType(t);
                    setCategory(t === "income" ? "Salary" : "Food");
                  }}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                    type === t
                      ? t === "income"
                        ? "bg-emerald-500 text-white"
                        : "bg-rose-500 text-white"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {t === "income" ? "Income" : "Expense"}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Amount (₹) *"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Description *"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground active:scale-95 transition-transform"
              >
                Add Transaction
              </button>
              <button
                onClick={resetForm}
                className="rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground active:scale-95 transition-transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        {(["all", "income", "expense"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filterType === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {f === "all" ? "All" : f === "income" ? "Income" : "Expenses"}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Wallet className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-base font-medium">No transactions yet</p>
          <p className="text-sm">Start tracking your income and expenses</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((txn) => (
            <div key={txn.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    txn.type === "income"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {txn.type === "income" ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium truncate">{txn.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded bg-secondary px-1.5 py-0.5 font-medium">
                      {txn.category}
                    </span>
                    <span>
                      {new Date(txn.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p
                    className={`text-base font-bold ${
                      txn.type === "income" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {txn.type === "income" ? "+" : "-"}
                    {formatINR(txn.amount)}
                  </p>
                  {deleteConfirm === txn.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(txn.id)}
                        className="rounded-lg bg-destructive p-1.5 text-white active:scale-95"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded-lg bg-secondary p-1.5 active:scale-95"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(txn.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
