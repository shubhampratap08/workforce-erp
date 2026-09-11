import { db } from "@/lib/db";
import { corsHeaders } from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await db.query("SELECT * FROM purchases WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Purchase not found", data: null }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ success: true, message: "Purchase fetched successfully", data: result.rows[0] }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to fetch purchase", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const quantity = Number(body.quantity || 0);
    const unitPrice = Number(body.unitPrice || 0);
    const gstPercentage = Number(body.gstPercentage || 0);
    const gstAmount = unitPrice * quantity * gstPercentage / 100;
    const totalAmount = (unitPrice * quantity) + gstAmount;

    const result = await db.query(
      `UPDATE purchases SET vendor_name = COALESCE($1, vendor_name), item_name = COALESCE($2, item_name), category = COALESCE($3, category), quantity = COALESCE($4, quantity), unit_price = COALESCE($5, unit_price), gst_percentage = COALESCE($6, gst_percentage), gst_amount = COALESCE($7, gst_amount), total_amount = COALESCE($8, total_amount), purchase_date = COALESCE($9, purchase_date), payment_method = COALESCE($10, payment_method), payment_status = COALESCE($11, payment_status), invoice_number = COALESCE($12, invoice_number), notes = COALESCE($13, notes), updated_at = CURRENT_TIMESTAMP WHERE id = $14 RETURNING *`,
      [body.vendorName || null, body.itemName || null, body.category || null, quantity > 0 ? quantity : null, unitPrice > 0 ? unitPrice : null, gstPercentage, gstAmount, totalAmount, body.purchaseDate || null, body.paymentMethod || null, body.paymentStatus || null, body.invoiceNumber || null, body.notes || null, id]
    );

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Purchase not found", data: null }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ success: true, message: "Purchase updated successfully", data: result.rows[0] }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to update purchase", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await db.query("DELETE FROM purchases WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Purchase not found", data: null }, { status: 404, headers: corsHeaders });
    }
    return Response.json({ success: true, message: "Purchase deleted successfully", data: { id } }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to delete purchase", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
