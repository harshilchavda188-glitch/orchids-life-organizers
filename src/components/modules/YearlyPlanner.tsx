"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X, CalendarClock } from "lucide-react";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { YearlyEvent, MONTHS, generateId } from "@/lib/types";
import { toast } from "sonner";

const EVENT_TYPES = ["goal", "exam", "family", "project", "other"] as const;
const TYPE_COLORS: Record<string, string> = {
  goal: "bg-emerald-500",
  exam: "bg-rose-500",
  family: "bg-violet-500",
  project: "bg-sky-500",
  other: "bg-amber-500",
};

export default function YearlyPlanner() {
  const currentYear = new Date().getFullYear();

  const [events, setEvents, isLoaded] = useLocalStorage<YearlyEvent[]>(
    "yearly-events",
    []
  );
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [title, setTitle] = useState("");
  const [month, setMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  const [description, setDescription] = useState("");
  const [type, setType] = useState<YearlyEvent["type"]>("goal");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAdd = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    const event: YearlyEvent = {
      id: generateId(),
      year: selectedYear,
      title: title.trim(),
      month,
      description: description.trim(),
      type,
    };
    setEvents((prev) => [...prev, event]);
    setTitle("");
    setDescription("");
    setType("goal");
    toast.success("Event added");
  };

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setDeleteConfirm(null);
    toast.success("Event removed");
  };

  const yearEvents = events.filter((e) => e.year === selectedYear);
  const groupedByMonth = MONTHS.reduce(
    (acc, m) => {
      const monthEvents = yearEvents.filter((e) => e.month === m);
      if (monthEvents.length > 0) acc[m] = monthEvents;
      return acc;
    },
    {} as Record<string, YearlyEvent[]>
  );

  if (!isLoaded) return null;

  return (
    <div className="px-5 pt-6 pb-4">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Yearly Planner</h1>
        <p className="text-sm text-muted-foreground">
          Plan goals, exams, and milestones for the year
        </p>
      </div>

      {/* Year Selector */}
      <div className="mb-5 flex items-center gap-2">
        {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(
          (y) => (
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
          )
        )}
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
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="flex-1 rounded-xl border border-input bg-background px-3 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as YearlyEvent["type"])}
            className="flex-1 rounded-xl border border-input bg-background px-3 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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

      {/* Events grouped by month */}
      {Object.keys(groupedByMonth).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <CalendarClock className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-base font-medium">No events for {selectedYear}</p>
          <p className="text-sm">Add events above to plan your year</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByMonth).map(([monthName, monthEvents]) => (
            <div key={monthName}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {monthName}
              </h3>
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
                      {event.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {event.description}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
