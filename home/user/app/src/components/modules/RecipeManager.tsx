"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChefHat,
  Search,
  ChevronDown,
  ChevronUp,
  Minus,
} from "lucide-react";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { Recipe, RECIPE_CATEGORIES, generateId } from "@/lib/types";
import { toast } from "sonner";

export default function RecipeManager() {
  const [recipes, setRecipes, isLoaded] = useLocalStorage<Recipe[]>(
    "recipes",
    []
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Recipe["category"]>("Breakfast");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setName("");
    setCategory("Breakfast");
    setIngredients([""]);
    setSteps([""]);
    setNotes("");
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter a recipe name");
      return;
    }
    const cleanIngredients = ingredients.filter((i) => i.trim());
    const cleanSteps = steps.filter((s) => s.trim());
    if (cleanIngredients.length === 0) {
      toast.error("Please add at least one ingredient");
      return;
    }
    if (cleanSteps.length === 0) {
      toast.error("Please add at least one step");
      return;
    }

    if (editingId) {
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                name: name.trim(),
                category,
                ingredients: cleanIngredients,
                steps: cleanSteps,
                notes: notes.trim(),
              }
            : r
        )
      );
      toast.success("Recipe updated");
    } else {
      const newRecipe: Recipe = {
        id: generateId(),
        name: name.trim(),
        category,
        ingredients: cleanIngredients,
        steps: cleanSteps,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      };
      setRecipes((prev) => [newRecipe, ...prev]);
      toast.success("Recipe added");
    }
    resetForm();
  };

  const handleEdit = (recipe: Recipe) => {
    setName(recipe.name);
    setCategory(recipe.category);
    setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : [""]);
    setSteps(recipe.steps.length > 0 ? recipe.steps : [""]);
    setNotes(recipe.notes);
    setEditingId(recipe.id);
    setShowForm(true);
    setExpandedId(null);
  };

  const handleDelete = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setDeleteConfirm(null);
    setExpandedId(null);
    toast.success("Recipe removed");
  };

  const updateListItem = (
    list: string[],
    setList: (v: string[]) => void,
    index: number,
    value: string
  ) => {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  };

  const addListItem = (list: string[], setList: (v: string[]) => void) => {
    setList([...list, ""]);
  };

  const removeListItem = (
    list: string[],
    setList: (v: string[]) => void,
    index: number
  ) => {
    if (list.length <= 1) return;
    setList(list.filter((_, i) => i !== index));
  };

  const filtered = recipes
    .filter((r) =>
      filterCategory === "All" ? true : r.category === filterCategory
    )
    .filter((r) =>
      searchQuery
        ? r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.ingredients.some((i) =>
            i.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : true
    );

  if (!isLoaded) return null;

  return (
    <div className="px-5 pt-6 pb-4">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Recipes</h1>
          <p className="text-sm text-muted-foreground">
            {recipes.length} recipes saved
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

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search recipes or ingredients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {["All", ...RECIPE_CATEGORIES].map((cat) => (
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

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold">
            {editingId ? "Edit Recipe" : "Add New Recipe"}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Recipe name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as Recipe["category"])
              }
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {RECIPE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Ingredients */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Ingredients *
              </label>
              {ingredients.map((ing, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <input
                    type="text"
                    placeholder={`Ingredient ${i + 1}`}
                    value={ing}
                    onChange={(e) =>
                      updateListItem(ingredients, setIngredients, i, e.target.value)
                    }
                    className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {ingredients.length > 1 && (
                    <button
                      onClick={() =>
                        removeListItem(ingredients, setIngredients, i)
                      }
                      className="rounded-xl border border-border p-2.5 text-muted-foreground active:scale-95"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addListItem(ingredients, setIngredients)}
                className="text-sm font-medium text-primary active:scale-95"
              >
                + Add Ingredient
              </button>
            </div>

            {/* Steps */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Steps *
              </label>
              {steps.map((step, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <span className="mt-2.5 text-sm font-medium text-muted-foreground">
                    {i + 1}.
                  </span>
                  <textarea
                    placeholder={`Step ${i + 1}`}
                    value={step}
                    onChange={(e) =>
                      updateListItem(steps, setSteps, i, e.target.value)
                    }
                    rows={2}
                    className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  {steps.length > 1 && (
                    <button
                      onClick={() => removeListItem(steps, setSteps, i)}
                      className="rounded-xl border border-border p-2.5 text-muted-foreground active:scale-95 self-start"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addListItem(steps, setSteps)}
                className="text-sm font-medium text-primary active:scale-95"
              >
                + Add Step
              </button>
            </div>

            <textarea
              placeholder="Notes or tips (optional)"
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
                {editingId ? "Update" : "Add Recipe"}
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

      {/* Recipes List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ChefHat className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-base font-medium">No recipes yet</p>
          <p className="text-sm">Add your favourite recipes to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((recipe) => {
            const isExpanded = expandedId === recipe.id;
            return (
              <div
                key={recipe.id}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : recipe.id)
                  }
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <ChefHat className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold truncate">
                      {recipe.name}
                    </p>
                    <span className="text-xs font-medium text-muted-foreground">
                      {recipe.category} &middot;{" "}
                      {recipe.ingredients.length} ingredients
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    <div className="mb-3">
                      <h4 className="mb-1.5 text-sm font-semibold text-foreground">
                        Ingredients
                      </h4>
                      <ul className="space-y-1">
                        {recipe.ingredients.map((ing, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-3">
                      <h4 className="mb-1.5 text-sm font-semibold text-foreground">
                        Steps
                      </h4>
                      <ol className="space-y-2">
                        {recipe.steps.map((step, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="shrink-0 font-semibold text-primary">
                              {i + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    {recipe.notes && (
                      <div className="mb-3 rounded-xl bg-secondary/50 p-3">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Notes:{" "}
                          </span>
                          {recipe.notes}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleEdit(recipe)}
                        className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground active:scale-95"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      {deleteConfirm === recipe.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(recipe.id)}
                            className="flex items-center gap-1.5 rounded-xl bg-destructive px-3 py-2 text-sm font-medium text-white active:scale-95"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground active:scale-95"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(recipe.id)}
                          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-destructive active:scale-95"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
