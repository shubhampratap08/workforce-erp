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
      whereClauses.push(`i.payment_status = $${index}`);
      values.push(status);
      index += 1;
    }

    if (month) {
      whereClauses.push(`i.billing_month = $${index}`);
      values.push(month);
      index += 1;
    }

    const total = await db.query(`SELECT COUNT(*)::int AS total FROM invoices i LEFT JOIN clients c ON c.id = i.client_id WHERE ${whereClauses.join(" AND ")}`, values);
    const rows = await db.query(`SELECT i.*, c.company_name AS "clientName" FROM invoices i LEFT JOIN clients c ON c.id = i.client_id WHERE ${whereClauses.join(" AND ")} ORDER BY i.id DESC LIMIT $${index} OFFSET $${index+1}`, [...values, limit, (page - 1) * limit]);

    return Response.json({ success: true, message: "Invoices fetched successfully", data: rows.rows, pagination: buildPagination(page, limit, total.rows[0].total || 0) }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to fetch invoices", error: error.message, data: [] }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const clientId = Number(body.clientId);
    if (!clientId || !body.billingMonth) {
      return Response.json({ success: false, message: "Client and billing month are required", data: null }, { status: 400, headers: corsHeaders });
    }

    const subtotal = Number(body.subtotal || 0);
    const gstPercentage = Number(body.gstPercentage || 0);
    const otherCharges = Number(body.otherCharges || 0);
    const discount = Number(body.discount || 0);
    const gstAmount = subtotal * gstPercentage / 100;
    const grandTotal = subtotal + gstAmount + otherCharges - discount;
    const invoiceNumber = body.invoiceNumber || `INV-${Date.now()}`;

    const result = await db.query(
      `
        INSERT INTO invoices (
          invoice_number,
          client_id,
          billing_month,
          number_of_workers,
          subtotal,
          gst_percentage,
          gst_amount,
          other_charges,
          discount,
          grand_total,
          due_date,
          payment_status,
          notes
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        RETURNING *
      `,
      [invoiceNumber, clientId, body.billingMonth, Number(body.numberOfWorkers || 0), subtotal, gstPercentage, gstAmount, otherCharges, discount, grandTotal, body.dueDate || null, body.paymentStatus || "Pending", body.notes || null]
    );

    return Response.json({ success: true, message: "Invoice created successfully", data: result.rows[0] }, { status: 201, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to create invoice", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
