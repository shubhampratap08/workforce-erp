import { db } from "@/lib/db";
import { ensureAdminUser, comparePassword, signToken } from "@/lib/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request) {
  try {
    await ensureAdminUser();
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return Response.json(
        {
          success: false,
          message: "Email and password are required",
          data: null,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await db.query(
      `
        SELECT id, full_name AS "fullName", email, password_hash AS "passwordHash", role, status
        FROM users
        WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password",
          data: null,
        },
        { status: 401, headers: corsHeaders }
      );
    }

    const user = result.rows[0];
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password",
          data: null,
        },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.fullName,
    });

    return Response.json(
      {
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            status: user.status,
          },
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Login error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to login",
        error: error.message,
        data: null,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
