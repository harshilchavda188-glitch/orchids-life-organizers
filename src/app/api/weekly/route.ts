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
      sql: "SELECT * FROM weekly_tasks WHERE user_id = ? ORDER BY id",
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
      sql: "INSERT INTO weekly_tasks (user_id, day, task) VALUES (?, ?, ?)",
      args: [userId, input.day, input.task],
    });
    return NextResponse.json({ id: Number(result.lastInsertRowid), message: "Task created" }, { status: 201 });
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
      sql: "UPDATE weekly_tasks SET day=?, task=?, completed=? WHERE id=? AND user_id=?",
      args: [input.day, input.task, input.completed || 0, input.id, userId],
    });
    return NextResponse.json({ message: "Task updated" });
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
      sql: "DELETE FROM weekly_tasks WHERE id=? AND user_id=?",
      args: [id, userId],
    });
    return NextResponse.json({ message: "Task deleted" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 500 });
  }
}
