import { db } from "@/lib/db";
import { corsHeaders, normalizePagination, buildPagination } from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = normalizePagination(searchParams);
    const search = (searchParams.get("search") || "").trim();
    const status = searchParams.get("status") || "";
    const month = searchParams.get("month") || "";

    const whereClauses = ["1 = 1"];
    const values = [];
    let index = 1;

    if (search) {
      whereClauses.push(`LOWER(vendor_name) LIKE LOWER('%' || $${index} || '%') OR LOWER(item_name) LIKE LOWER('%' || $${index} || '%')`);
      values.push(search);
      index += 1;
    }
    if (status) {
      whereClauses.push(`payment_status = $${index}`);
      values.push(status);
      index += 1;
    }
    if (month) {
      whereClauses.push(`TO_CHAR(purchase_date, 'YYYY-MM') = $${index}`);
      values.push(month);
      index += 1;
    }

    const total = await db.query(`SELECT COUNT(*)::int AS total FROM purchases WHERE ${whereClauses.join(" AND ")}`, values);
    const rows = await db.query(`SELECT * FROM purchases WHERE ${whereClauses.join(" AND ")} ORDER BY purchase_date DESC LIMIT $${index} OFFSET $${index + 1}`, [...values, limit, (page - 1) * limit]);

    return Response.json({ success: true, message: "Purchases fetched successfully", data: rows.rows, pagination: buildPagination(page, limit, total.rows[0].total || 0) }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to fetch purchases", error: error.message, data: [] }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const quantity = Number(body.quantity || 0);
    const unitPrice = Number(body.unitPrice || 0);
    if (!body.vendorName || !body.itemName || quantity <= 0 || unitPrice <= 0 || !body.purchaseDate) {
      return Response.json({ success: false, message: "Vendor, item, quantity, price and date are required", data: null }, { status: 400, headers: corsHeaders });
    }

    const gstPercentage = Number(body.gstPercentage || 0);
    const gstAmount = unitPrice * quantity * gstPercentage / 100;
    const totalAmount = (unitPrice * quantity) + gstAmount;
    const purchaseId = `PUR-${Date.now()}`;

    const result = await db.query(
      `INSERT INTO purchases (purchase_id, vendor_name, item_name, category, quantity, unit_price, gst_percentage, gst_amount, total_amount, purchase_date, payment_method, payment_status, invoice_number, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [purchaseId, body.vendorName, body.itemName, body.category || "Other", quantity, unitPrice, gstPercentage, gstAmount, totalAmount, body.purchaseDate, body.paymentMethod || "Cash", body.paymentStatus || "Pending", body.invoiceNumber || null, body.notes || null]
    );

    return Response.json({ success: true, message: "Purchase created successfully", data: result.rows[0] }, { status: 201, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to create purchase", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
