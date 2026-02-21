"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, ShoppingCart } from "lucide-react";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import {
  ShoppingItem,
  SHOPPING_CATEGORIES,
  generateId,
} from "@/lib/types";
import { toast } from "sonner";

export default function ShoppingList() {
  const [items, setItems, isLoaded] = useLocalStorage<ShoppingItem[]>(
    "shopping-items",
    []
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ShoppingItem["category"]>("Groceries");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setName("");
    setCategory("Groceries");
    setQuantity("");
    setNotes("");
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter an item name");
      return;
    }

    if (editingId) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...item, name: name.trim(), category, quantity: quantity.trim(), notes: notes.trim() }
            : item
        )
      );
      toast.success("Item updated");
    } else {
      const newItem: ShoppingItem = {
        id: generateId(),
        name: name.trim(),
        category,
        quantity: quantity.trim(),
        notes: notes.trim(),
        purchased: false,
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [newItem, ...prev]);
      toast.success("Item added");
    }
    resetForm();
  };

  const handleEdit = (item: ShoppingItem) => {
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantity);
    setNotes(item.notes);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setDeleteConfirm(null);
    toast.success("Item removed");
  };

  const togglePurchased = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, purchased: !item.purchased } : item
      )
    );
  };

  const filtered =
    filterCategory === "All"
      ? items
      : items.filter((item) => item.category === filterCategory);

  const purchasedCount = items.filter((i) => i.purchased).length;

  if (!isLoaded) return null;

  return (
    <div className="px-5 pt-6 pb-4">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Shopping List</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} items &middot; {purchasedCount} purchased
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

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold">
            {editingId ? "Edit Item" : "Add New Item"}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Item name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ShoppingItem["category"])}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {SHOPPING_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Quantity (e.g., 2 kg, 1 pack)"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground active:scale-95 transition-transform"
              >
                {editingId ? "Update" : "Add Item"}
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
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {["All", ...SHOPPING_CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filterCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ShoppingCart className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-base font-medium">No items yet</p>
          <p className="text-sm">Tap &quot;Add&quot; to start your shopping list</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-card p-4 transition-all ${
                item.purchased ? "border-border/50 opacity-60" : "border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => togglePurchased(item.id)}
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
                    item.purchased
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {item.purchased && <Check className="h-3.5 w-3.5" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-base font-medium ${
                      item.purchased ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {item.name}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      {item.category}
                    </span>
                    {item.quantity && (
                      <span className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(item)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-secondary active:scale-95"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  {deleteConfirm === item.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg bg-destructive p-2 text-white active:scale-95"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded-lg bg-secondary p-2 active:scale-95"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-secondary active:scale-95"
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
