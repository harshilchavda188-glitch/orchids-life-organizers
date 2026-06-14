import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { compareSync } from "bcrypt";
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
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const db = getDb();

    const result = await db.execute({
      sql: "SELECT id, name, email, password FROM users WHERE email = ?",
      args: [email.toLowerCase()],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = result.rows[0];
    const match = compareSync(password, user.password as string);

    if (!match) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = generateToken(Number(user.id));

    return NextResponse.json({
      token,
      user: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        authMethod: "email",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
