"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X, CalendarDays } from "lucide-react";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { WeeklyTask, DAYS_OF_WEEK, generateId } from "@/lib/types";
import { toast } from "sonner";

export default function WeeklyPlanner() {
  const [tasks, setTasks, isLoaded] = useLocalStorage<WeeklyTask[]>(
    "weekly-tasks",
    []
  );
  const [selectedDay, setSelectedDay] = useState(
    DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  );
  const [newTask, setNewTask] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newTask.trim()) {
      toast.error("Please enter a task");
      return;
    }
    const task: WeeklyTask = {
      id: generateId(),
      day: selectedDay,
      task: newTask.trim(),
      completed: false,
    };
    setTasks((prev) => [...prev, task]);
    setNewTask("");
    toast.success("Task added");
  };

  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDeleteConfirm(null);
    toast.success("Task removed");
  };

  const dayTasks = tasks.filter((t) => t.day === selectedDay);
  const completedCount = dayTasks.filter((t) => t.completed).length;

  if (!isLoaded) return null;

  return (
    <div className="px-5 pt-6 pb-4">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Weekly Planner</h1>
        <p className="text-sm text-muted-foreground">
          Plan your tasks for each day of the week
        </p>
      </div>

      {/* Day Selector */}
      <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
        {DAYS_OF_WEEK.map((day) => {
          const count = tasks.filter((t) => t.day === day).length;
          const done = tasks.filter((t) => t.day === day && t.completed).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex shrink-0 flex-col items-center rounded-2xl px-3 py-2.5 transition-colors ${
                selectedDay === day
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <span className="text-xs font-bold">{day.slice(0, 3)}</span>
              {count > 0 && (
                <span className={`mt-0.5 text-[10px] ${selectedDay === day ? "opacity-80" : "opacity-60"}`}>
                  {done}/{count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Progress */}
      {dayTasks.length > 0 && (
        <div className="mb-4 rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{selectedDay}</span>
            <span className="text-muted-foreground">
              {completedCount}/{dayTasks.length} done
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-secondary">
            <div
              className="h-2 rounded-full bg-sky-500 transition-all"
              style={{
                width: `${dayTasks.length > 0 ? (completedCount / dayTasks.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Add Task */}
      <div className="mb-5 flex gap-2">
        <input
          type="text"
          placeholder="Add a task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={handleAdd}
          className="rounded-xl bg-primary px-4 py-3 text-primary-foreground active:scale-95 transition-transform"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Tasks List */}
      {dayTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <CalendarDays className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-base font-medium">No tasks for {selectedDay}</p>
          <p className="text-sm">Add tasks above to plan your day</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dayTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 rounded-2xl border bg-card p-4 transition-all ${
                task.completed ? "border-border/50 opacity-60" : "border-border"
              }`}
            >
              <button
                onClick={() => toggleComplete(task.id)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
                  task.completed
                    ? "border-sky-500 bg-sky-500 text-white"
                    : "border-muted-foreground/30"
                }`}
              >
                {task.completed && <Check className="h-3.5 w-3.5" />}
              </button>
              <p
                className={`flex-1 text-base ${
                  task.completed
                    ? "line-through text-muted-foreground"
                    : "font-medium"
                }`}
              >
                {task.task}
              </p>
              {deleteConfirm === task.id ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleDelete(task.id)}
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
                  onClick={() => setDeleteConfirm(task.id)}
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
