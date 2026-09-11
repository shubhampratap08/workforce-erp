import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "workforce-erp-dev-secret";

export async function ensureAdminUser() {
  const email = (process.env.ADMIN_EMAIL || "admin@workforceerp.com").trim();
  const password = process.env.ADMIN_PASSWORD || "Admin@123";

  if (!email || !password) {
    return null;
  }

  const existingUser = await db.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    return { email };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.query(
    `
      INSERT INTO users (
        full_name,
        email,
        password_hash,
        role,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `,
    ["System Administrator", email, passwordHash, "Admin", "Active"]
  );

  return { email };
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function getBearerToken(request) {
  const headerValue = request.headers.get("authorization") || "";

  if (!headerValue.startsWith("Bearer ")) {
    return null;
  }

  return headerValue.slice(7).trim();
}

export async function requireAuth(request) {
  const token = getBearerToken(request);

  if (!token) {
    throw new Error("Authentication required");
  }

  return verifyToken(token);
}

export const comparePassword = async (password, passwordHash) =>
  bcrypt.compare(password, passwordHash);

export const hashPassword = async (password) => bcrypt.hash(password, 10);
