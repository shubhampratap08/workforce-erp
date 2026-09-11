import { db } from "@/lib/db";
import { corsHeaders, normalizePagination, buildPagination } from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = normalizePagination(searchParams);
    const search = (searchParams.get("search") || "").trim();
    const status = searchParams.get("status") || "";

    const whereClauses = ["1 = 1"];
    const values = [];
    let index = 1;

    if (search) {
      whereClauses.push(`LOWER(a.asset_name) LIKE LOWER('%' || $${index} || '%') OR LOWER(COALESCE(a.serial_number, '')) LIKE LOWER('%' || $${index} || '%')`);
      values.push(search);
      index += 1;
    }

    if (status) {
      whereClauses.push(`a.status = $${index}`);
      values.push(status);
      index += 1;
    }

    const total = await db.query(`SELECT COUNT(*)::int AS total FROM assets a WHERE ${whereClauses.join(" AND ")}`, values);
    const rows = await db.query(`SELECT a.*, w.full_name AS "assignedWorkerName", c.company_name AS "assignedClientName" FROM assets a LEFT JOIN workers w ON w.id = a.assigned_worker_id LEFT JOIN clients c ON c.id = a.assigned_client_id WHERE ${whereClauses.join(" AND ")} ORDER BY a.id DESC LIMIT $${index} OFFSET $${index + 1}`, [...values, limit, (page - 1) * limit]);

    return Response.json({ success: true, message: "Assets fetched successfully", data: rows.rows, pagination: buildPagination(page, limit, total.rows[0].total || 0) }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to fetch assets", error: error.message, data: [] }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const assetName = String(body.assetName || "").trim();
    const category = String(body.category || "").trim();
    const purchaseCost = Number(body.purchaseCost || 0);

    if (!assetName || !category || purchaseCost < 0) {
      return Response.json({ success: false, message: "Asset name, category and valid purchase cost are required", data: null }, { status: 400, headers: corsHeaders });
    }

    const assetId = `AST-${Date.now()}`;
    const result = await db.query(
      `INSERT INTO assets (asset_id, asset_name, category, serial_number, purchase_date, purchase_cost, asset_condition, assigned_worker_id, assigned_client_id, issue_date, return_date, status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [assetId, assetName, category, body.serialNumber || null, body.purchaseDate || null, purchaseCost, body.assetCondition || "Good", body.assignedWorkerId ? Number(body.assignedWorkerId) : null, body.assignedClientId ? Number(body.assignedClientId) : null, body.issueDate || null, body.returnDate || null, body.status || "Available", body.notes || null]
    );

    return Response.json({ success: true, message: "Asset created successfully", data: result.rows[0] }, { status: 201, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to create asset", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
