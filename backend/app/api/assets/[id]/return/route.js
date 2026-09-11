import { db } from "@/lib/db";
import { corsHeaders } from "@/lib/api-helpers";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const result = await db.query(
      `UPDATE assets SET assigned_worker_id = NULL, assigned_client_id = NULL, issue_date = NULL, return_date = CURRENT_DATE, status = 'Available', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Asset not found", data: null }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ success: true, message: "Asset returned successfully", data: result.rows[0] }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to return asset", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
