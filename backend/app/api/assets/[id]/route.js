import { db } from "@/lib/db";
import { corsHeaders } from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await db.query(`SELECT a.*, w.full_name AS "assignedWorkerName", c.company_name AS "assignedClientName" FROM assets a LEFT JOIN workers w ON w.id = a.assigned_worker_id LEFT JOIN clients c ON c.id = a.assigned_client_id WHERE a.id = $1`, [id]);
    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Asset not found", data: null }, { status: 404, headers: corsHeaders });
    }
    return Response.json({ success: true, message: "Asset fetched successfully", data: result.rows[0] }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to fetch asset", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const purchaseCost = Number(body.purchaseCost || 0);
    const result = await db.query(
      `UPDATE assets SET asset_name = COALESCE($1, asset_name), category = COALESCE($2, category), serial_number = COALESCE($3, serial_number), purchase_date = COALESCE($4, purchase_date), purchase_cost = COALESCE($5, purchase_cost), asset_condition = COALESCE($6, asset_condition), assigned_worker_id = COALESCE($7, assigned_worker_id), assigned_client_id = COALESCE($8, assigned_client_id), issue_date = COALESCE($9, issue_date), return_date = COALESCE($10, return_date), status = COALESCE($11, status), notes = COALESCE($12, notes), updated_at = CURRENT_TIMESTAMP WHERE id = $13 RETURNING *`,
      [body.assetName || null, body.category || null, body.serialNumber || null, body.purchaseDate || null, purchaseCost >= 0 ? purchaseCost : null, body.assetCondition || null, body.assignedWorkerId ? Number(body.assignedWorkerId) : null, body.assignedClientId ? Number(body.assignedClientId) : null, body.issueDate || null, body.returnDate || null, body.status || null, body.notes || null, id]
    );

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Asset not found", data: null }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ success: true, message: "Asset updated successfully", data: result.rows[0] }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to update asset", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await db.query("DELETE FROM assets WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Asset not found", data: null }, { status: 404, headers: corsHeaders });
    }
    return Response.json({ success: true, message: "Asset deleted successfully", data: { id } }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to delete asset", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
