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
      sql: "SELECT * FROM monthly_events WHERE user_id = ? ORDER BY year DESC, month",
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
      sql: "INSERT INTO monthly_events (user_id, month, year, title, event_date, notes, type) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [userId, input.month, input.year, input.title, input.event_date || null, input.notes || "", input.type || "event"],
    });
    return NextResponse.json({ id: Number(result.lastInsertRowid), message: "Event created" }, { status: 201 });
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
      sql: "UPDATE monthly_events SET month=?, year=?, title=?, event_date=?, notes=?, type=? WHERE id=? AND user_id=?",
      args: [input.month, input.year, input.title, input.event_date || null, input.notes || "", input.type || "event", input.id, userId],
    });
    return NextResponse.json({ message: "Event updated" });
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
      sql: "DELETE FROM monthly_events WHERE id=? AND user_id=?",
      args: [id, userId],
    });
    return NextResponse.json({ message: "Event deleted" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 500 });
  }
}
