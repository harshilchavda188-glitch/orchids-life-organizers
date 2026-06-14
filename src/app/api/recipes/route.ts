import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

function getDb() {
  return createClient({
    url: process.env.DATABASE_URL || "file:./smartlife.db",
  });
}

function getUserId(req: NextRequest): number {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "");
  if (!token) throw new Error("Unauthorized");
  const payload = JSON.parse(Buffer.from(token.split(".")[0], "base64").toString());
  return payload.user_id;
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT * FROM recipes WHERE user_id = ? ORDER BY created_at DESC",
      args: [userId],
    });
    const recipes = result.rows.map((r: any) => ({
      ...r,
      ingredients: JSON.parse(r.ingredients || "[]"),
      steps: JSON.parse(r.steps || "[]"),
    }));
    return NextResponse.json(recipes);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const input = await req.json();
    const db = getDb();
    const result = await db.execute({
      sql: "INSERT INTO recipes (user_id, name, category, ingredients, steps, notes) VALUES (?, ?, ?, ?, ?, ?)",
      args: [userId, input.name, input.category || "Lunch", JSON.stringify(input.ingredients || []), JSON.stringify(input.steps || []), input.notes || ""],
    });
    return NextResponse.json({ id: Number(result.lastInsertRowid), message: "Recipe created" }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const input = await req.json();
    const db = getDb();
    await db.execute({
      sql: "UPDATE recipes SET name=?, category=?, ingredients=?, steps=?, notes=? WHERE id=? AND user_id=?",
      args: [input.name, input.category, JSON.stringify(input.ingredients || []), JSON.stringify(input.steps || []), input.notes || "", input.id, userId],
    });
    return NextResponse.json({ message: "Recipe updated" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const id = req.nextUrl.searchParams.get("id");
    const db = getDb();
    await db.execute({
      sql: "DELETE FROM recipes WHERE id=? AND user_id=?",
      args: [id, userId],
    });
    return NextResponse.json({ message: "Recipe deleted" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 500 });
  }
}
