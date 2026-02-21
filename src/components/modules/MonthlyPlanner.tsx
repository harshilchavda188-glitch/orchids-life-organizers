"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X, CalendarRange } from "lucide-react";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { MonthlyEvent, MONTHS, generateId } from "@/lib/types";
import { toast } from "sonner";

const EVENT_TYPES = ["goal", "reminder", "event"] as const;
const TYPE_COLORS: Record<string, string> = {
  goal: "bg-emerald-500",
  reminder: "bg-amber-500",
  event: "bg-sky-500",
};

export default function MonthlyPlanner() {
  const currentMonth = MONTHS[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  const [events, setEvents, isLoaded] = useLocalStorage<MonthlyEvent[]>(
    "monthly-events",
    []
  );
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<MonthlyEvent["type"]>("event");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAdd = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    const event: MonthlyEvent = {
      id: generateId(),
      month: selectedMonth,
      year: selectedYear,
      title: title.trim(),
      date: date.trim(),
      notes: notes.trim(),
      type,
    };
    setEvents((prev) => [...prev, event]);
    setTitle("");
    setDate("");
    setNotes("");
    setType("event");
    toast.success("Event added");
  };

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setDeleteConfirm(null);
    toast.success("Event removed");
  };

  const monthEvents = events.filter(
    (e) => e.month === selectedMonth && e.year === selectedYear
  );

  if (!isLoaded) return null;

  return (
    <div className="px-5 pt-6 pb-4">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Monthly Planner</h1>
        <p className="text-sm text-muted-foreground">
          Track goals, reminders, and events each month
        </p>
      </div>

      {/* Year Selector */}
      <div className="mb-3 flex items-center gap-2">
        {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
          <button
            key={y}
            onClick={() => setSelectedYear(y)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              selectedYear === y
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Month Selector */}
      <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
        {MONTHS.map((month) => {
          const count = events.filter(
            (e) => e.month === month && e.year === selectedYear
          ).length;
          return (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`flex shrink-0 flex-col items-center rounded-2xl px-3 py-2.5 transition-colors ${
                selectedMonth === month
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <span className="text-xs font-bold">{month.slice(0, 3)}</span>
              {count > 0 && (
                <span
                  className={`mt-0.5 text-[10px] ${
                    selectedMonth === month ? "opacity-80" : "opacity-60"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add Event Form */}
      <div className="mb-5 space-y-2">
        <input
          type="text"
          placeholder="Event title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Date (e.g. 15th)"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as MonthlyEvent["type"])}
            className="rounded-xl border border-input bg-background px-3 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleAdd}
            className="rounded-xl bg-primary px-4 py-3 text-primary-foreground active:scale-95 transition-transform"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Events List */}
      {monthEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <CalendarRange className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-base font-medium">
            No events for {selectedMonth} {selectedYear}
          </p>
          <p className="text-sm">Add events above to plan your month</p>
        </div>
      ) : (
        <div className="space-y-2">
          {monthEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div
                className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                  TYPE_COLORS[event.type]
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-base">{event.title}</p>
                {event.date && (
                  <p className="text-sm text-muted-foreground">{event.date}</p>
                )}
                {event.notes && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.notes}
                  </p>
                )}
                <span className="mt-1 inline-block rounded-lg bg-secondary px-2 py-0.5 text-xs capitalize text-secondary-foreground">
                  {event.type}
                </span>
              </div>
              {deleteConfirm === event.id ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleDelete(event.id)}
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
                  onClick={() => setDeleteConfirm(event.id)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary active:scale-95"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
