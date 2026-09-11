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
      whereClauses.push(`LOWER(c.company_name) LIKE LOWER('%' || $${index} || '%')`);
      values.push(search);
      index += 1;
    }
    if (status) {
      whereClauses.push(`s.payment_status = $${index}`);
      values.push(status);
      index += 1;
    }
    if (month) {
      whereClauses.push(`TO_CHAR(s.sale_date, 'YYYY-MM') = $${index}`);
      values.push(month);
      index += 1;
    }

    const total = await db.query(`SELECT COUNT(*)::int AS total FROM sales s LEFT JOIN clients c ON c.id = s.client_id WHERE ${whereClauses.join(" AND ")}`, values);
    const rows = await db.query(`SELECT s.*, c.company_name AS "clientName" FROM sales s LEFT JOIN clients c ON c.id = s.client_id WHERE ${whereClauses.join(" AND ")} ORDER BY s.sale_date DESC LIMIT $${index} OFFSET $${index + 1}`, [...values, limit, (page - 1) * limit]);

    return Response.json({ success: true, message: "Sales fetched successfully", data: rows.rows, pagination: buildPagination(page, limit, total.rows[0].total || 0) }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to fetch sales", error: error.message, data: [] }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const clientId = Number(body.clientId);
    if (!clientId || !body.amount || !body.saleDate) {
      return Response.json({ success: false, message: "Client, amount and sale date are required", data: null }, { status: 400, headers: corsHeaders });
    }

    const amount = Number(body.amount);
    if (amount <= 0) {
      return Response.json({ success: false, message: "Amount must be positive", data: null }, { status: 400, headers: corsHeaders });
    }

    const saleId = `SAL-${Date.now()}`;
    const result = await db.query(
      `INSERT INTO sales (sale_id, client_id, invoice_id, amount, sale_date, payment_method, transaction_reference, payment_status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [saleId, clientId, body.invoiceId ? Number(body.invoiceId) : null, amount, body.saleDate, body.paymentMethod || "Cash", body.transactionReference || null, body.paymentStatus || "Paid", body.notes || null]
    );

    return Response.json({ success: true, message: "Sale created successfully", data: result.rows[0] }, { status: 201, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to create sale", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
