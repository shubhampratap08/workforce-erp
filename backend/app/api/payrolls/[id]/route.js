import { db } from "@/lib/db";
import { corsHeaders } from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await db.query(
      `
        SELECT p.*, w.full_name AS "workerName", w.worker_id AS "workerId"
        FROM payrolls p
        LEFT JOIN workers w ON w.id = p.worker_id
        WHERE p.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Payroll not found", data: null }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ success: true, message: "Payroll fetched successfully", data: result.rows[0] }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to fetch payroll", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await db.query(
      `
        UPDATE payrolls
        SET
          worker_id = COALESCE($1, worker_id),
          salary_month = COALESCE($2, salary_month),
          basic_salary = COALESCE($3, basic_salary),
          working_days = COALESCE($4, working_days),
          present_days = COALESCE($5, present_days),
          absent_days = COALESCE($6, absent_days),
          half_days = COALESCE($7, half_days),
          overtime_hours = COALESCE($8, overtime_hours),
          overtime_amount = COALESCE($9, overtime_amount),
          bonus = COALESCE($10, bonus),
          advance_deduction = COALESCE($11, advance_deduction),
          pf_deduction = COALESCE($12, pf_deduction),
          esi_deduction = COALESCE($13, esi_deduction),
          other_deduction = COALESCE($14, other_deduction),
          absent_deduction = COALESCE($15, absent_deduction),
          net_salary = COALESCE($16, net_salary),
          payment_status = COALESCE($17, payment_status),
          payment_date = COALESCE($18, payment_date),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $19
        RETURNING *
      `,
      [
        body.workerId ? Number(body.workerId) : null,
        body.salaryMonth || null,
        body.basicSalary !== undefined ? Number(body.basicSalary) : null,
        body.workingDays !== undefined ? Number(body.workingDays) : null,
        body.presentDays !== undefined ? Number(body.presentDays) : null,
        body.absentDays !== undefined ? Number(body.absentDays) : null,
        body.halfDays !== undefined ? Number(body.halfDays) : null,
        body.overtimeHours !== undefined ? Number(body.overtimeHours) : null,
        body.overtimeAmount !== undefined ? Number(body.overtimeAmount) : null,
        body.bonus !== undefined ? Number(body.bonus) : null,
        body.advanceDeduction !== undefined ? Number(body.advanceDeduction) : null,
        body.pfDeduction !== undefined ? Number(body.pfDeduction) : null,
        body.esiDeduction !== undefined ? Number(body.esiDeduction) : null,
        body.otherDeduction !== undefined ? Number(body.otherDeduction) : null,
        body.absentDeduction !== undefined ? Number(body.absentDeduction) : null,
        body.netSalary !== undefined ? Number(body.netSalary) : null,
        body.paymentStatus || null,
        body.paymentDate || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Payroll not found", data: null }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ success: true, message: "Payroll updated successfully", data: result.rows[0] }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to update payroll", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await db.query("DELETE FROM payrolls WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Payroll not found", data: null }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ success: true, message: "Payroll deleted successfully", data: { id } }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to delete payroll", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
