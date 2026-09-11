import { db } from "@/lib/db";
import { corsHeaders } from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await db.query(
      `SELECT i.*, c.company_name AS "clientName" FROM invoices i LEFT JOIN clients c ON c.id = i.client_id WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Invoice not found", data: null }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ success: true, message: "Invoice fetched successfully", data: result.rows[0] }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to fetch invoice", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const subtotal = Number(body.subtotal || 0);
    const gstPercentage = Number(body.gstPercentage || 0);
    const otherCharges = Number(body.otherCharges || 0);
    const discount = Number(body.discount || 0);
    const gstAmount = subtotal * gstPercentage / 100;
    const grandTotal = subtotal + gstAmount + otherCharges - discount;

    const result = await db.query(
      `
        UPDATE invoices
        SET
          client_id = COALESCE($1, client_id),
          billing_month = COALESCE($2, billing_month),
          number_of_workers = COALESCE($3, number_of_workers),
          subtotal = COALESCE($4, subtotal),
          gst_percentage = COALESCE($5, gst_percentage),
          gst_amount = COALESCE($6, gst_amount),
          other_charges = COALESCE($7, other_charges),
          discount = COALESCE($8, discount),
          grand_total = COALESCE($9, grand_total),
          due_date = COALESCE($10, due_date),
          payment_status = COALESCE($11, payment_status),
          notes = COALESCE($12, notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $13
        RETURNING *
      `,
      [
        body.clientId ? Number(body.clientId) : null,
        body.billingMonth || null,
        body.numberOfWorkers !== undefined ? Number(body.numberOfWorkers) : null,
        subtotal,
        gstPercentage,
        gstAmount,
        otherCharges,
        discount,
        grandTotal,
        body.dueDate || null,
        body.paymentStatus || null,
        body.notes || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Invoice not found", data: null }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ success: true, message: "Invoice updated successfully", data: result.rows[0] }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to update invoice", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await db.query("DELETE FROM invoices WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Invoice not found", data: null }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ success: true, message: "Invoice deleted successfully", data: { id } }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to delete invoice", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
