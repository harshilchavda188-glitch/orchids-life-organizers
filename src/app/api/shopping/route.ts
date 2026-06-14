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
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[0], "base64").toString());
    return payload.user_id;
  } catch {
    throw new Error("Invalid token");
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT * FROM shopping_items WHERE user_id = ? ORDER BY created_at DESC",
      args: [userId],
    });
    return NextResponse.json(result.rows);
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
      sql: "INSERT INTO shopping_items (user_id, name, category, quantity, notes) VALUES (?, ?, ?, ?, ?)",
      args: [userId, input.name, input.category || "Groceries", input.quantity || "", input.notes || ""],
    });
    return NextResponse.json({ id: Number(result.lastInsertRowid), message: "Item created" }, { status: 201 });
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
      sql: "UPDATE shopping_items SET name=?, category=?, quantity=?, notes=?, purchased=? WHERE id=? AND user_id=?",
      args: [input.name, input.category, input.quantity, input.notes, input.purchased || 0, input.id, userId],
    });
    return NextResponse.json({ message: "Item updated" });
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
      sql: "DELETE FROM shopping_items WHERE id=? AND user_id=?",
      args: [id, userId],
    });
    return NextResponse.json({ message: "Item deleted" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 500 });
  }
}
