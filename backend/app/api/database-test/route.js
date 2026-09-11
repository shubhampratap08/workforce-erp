import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.query(
      "SELECT NOW() AS current_time"
    );

    return Response.json({
      success: true,
      message: "PostgreSQL connected successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database error:", error);

    return Response.json(
      {
        success: false,
        message: "PostgreSQL connection failed",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}