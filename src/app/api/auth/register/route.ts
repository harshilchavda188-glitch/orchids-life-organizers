import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { hashSync } from "bcrypt";
import crypto from "crypto";

function getDb() {
  return createClient({
    url: process.env.DATABASE_URL || "file:./smartlife.db",
  });
}

function generateToken(userId: number): string {
  const payload = Buffer.from(
    JSON.stringify({ user_id: userId, exp: Math.floor(Date.now() / 1000) + 86400 * 7 })
  ).toString("base64");
  const signature = crypto.createHmac("sha256", "smartlife_secret_key").update(payload).digest("base64");
  return `${payload}.${signature}`;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const db = getDb();

    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email.toLowerCase()],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashed = hashSync(password, 10);
    const result = await db.execute({
      sql: "INSERT INTO users (name, email, password, phone, auth_method) VALUES (?, ?, ?, ?, 'email')",
      args: [name, email.toLowerCase(), hashed, phone || ""],
    });

    const userId = Number(result.lastInsertRowid);
    const token = generateToken(userId);

    return NextResponse.json(
      {
        token,
        user: { id: userId, name, email, authMethod: "email" },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
