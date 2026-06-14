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
      sql: "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC",
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
      sql: "INSERT INTO transactions (user_id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)",
      args: [userId, input.type, input.amount, input.category, input.description, input.date || new Date().toISOString().split("T")[0]],
    });
    return NextResponse.json({ id: Number(result.lastInsertRowid), message: "Transaction created" }, { status: 201 });
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
      sql: "DELETE FROM transactions WHERE id=? AND user_id=?",
      args: [id, userId],
    });
    return NextResponse.json({ message: "Transaction deleted" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 500 });
  }
}
