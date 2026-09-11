import { db } from "@/lib/db";
import { corsHeaders } from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await db.query(`SELECT s.*, c.company_name AS "clientName" FROM sales s LEFT JOIN clients c ON c.id = s.client_id WHERE s.id = $1`, [id]);
    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Sale not found", data: null }, { status: 404, headers: corsHeaders });
    }
    return Response.json({ success: true, message: "Sale fetched successfully", data: result.rows[0] }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to fetch sale", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const amount = Number(body.amount || 0);
    if (amount <= 0) {
      return Response.json({ success: false, message: "Amount must be positive", data: null }, { status: 400, headers: corsHeaders });
    }

    const result = await db.query(
      `UPDATE sales SET client_id = COALESCE($1, client_id), invoice_id = COALESCE($2, invoice_id), amount = COALESCE($3, amount), sale_date = COALESCE($4, sale_date), payment_method = COALESCE($5, payment_method), transaction_reference = COALESCE($6, transaction_reference), payment_status = COALESCE($7, payment_status), notes = COALESCE($8, notes), updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *`,
      [body.clientId ? Number(body.clientId) : null, body.invoiceId ? Number(body.invoiceId) : null, amount, body.saleDate || null, body.paymentMethod || null, body.transactionReference || null, body.paymentStatus || null, body.notes || null, id]
    );

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Sale not found", data: null }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ success: true, message: "Sale updated successfully", data: result.rows[0] }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to update sale", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await db.query("DELETE FROM sales WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Sale not found", data: null }, { status: 404, headers: corsHeaders });
    }
    return Response.json({ success: true, message: "Sale deleted successfully", data: { id } }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to delete sale", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
