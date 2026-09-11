import { db } from "@/lib/db";
import { corsHeaders } from "@/lib/api-helpers";

export async function POST(request) {
  try {
    const body = await request.json();
    const month = body.month || new Date().toISOString().slice(0, 7);

    const workers = await db.query("SELECT id, full_name AS \"fullName\", salary FROM workers WHERE status IN ('Available', 'Deployed', 'On Leave')");

    const createdPayrolls = [];

    for (const worker of workers.rows) {
      const attendanceRows = await db.query(
        `
          SELECT
            COUNT(*)::int AS working_days,
            SUM(CASE WHEN attendance_status = 'Present' THEN 1 ELSE 0 END)::int AS present_days,
            SUM(CASE WHEN attendance_status = 'Absent' THEN 1 ELSE 0 END)::int AS absent_days,
            SUM(CASE WHEN attendance_status = 'Half Day' THEN 1 ELSE 0 END)::int AS half_days,
            COALESCE(SUM(overtime_hours), 0)::numeric AS overtime_hours
          FROM attendance
          WHERE worker_id = $1 AND TO_CHAR(attendance_date, 'YYYY-MM') = $2
        `,
        [worker.id, month]
      );

      const metrics = attendanceRows.rows[0];
      const overtimeHours = Number(metrics.overtime_hours || 0);
      const overtimeAmount = overtimeHours * Number(worker.salary || 0) / 30 / 8;
      const basicSalary = Number(worker.salary || 0);
      const absentDeduction = Number(metrics.absent_days || 0) * (basicSalary / Math.max(Number(metrics.working_days || 30), 1));
      const netSalary = basicSalary + overtimeAmount - absentDeduction;

      const payrollId = `PAY-${Date.now()}-${worker.id}`;
      const result = await db.query(
        `
          INSERT INTO payrolls (
            payroll_id,
            worker_id,
            salary_month,
            basic_salary,
            working_days,
            present_days,
            absent_days,
            half_days,
            overtime_hours,
            overtime_amount,
            bonus,
            advance_deduction,
            pf_deduction,
            esi_deduction,
            other_deduction,
            absent_deduction,
            net_salary,
            payment_status,
            payment_date
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
          ON CONFLICT (worker_id, salary_month) DO UPDATE SET
            basic_salary = EXCLUDED.basic_salary,
            working_days = EXCLUDED.working_days,
            present_days = EXCLUDED.present_days,
            absent_days = EXCLUDED.absent_days,
            half_days = EXCLUDED.half_days,
            overtime_hours = EXCLUDED.overtime_hours,
            overtime_amount = EXCLUDED.overtime_amount,
            absent_deduction = EXCLUDED.absent_deduction,
            net_salary = EXCLUDED.net_salary,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `,
        [
          payrollId,
          worker.id,
          month,
          basicSalary,
          Number(metrics.working_days || 30),
          Number(metrics.present_days || 0),
          Number(metrics.absent_days || 0),
          Number(metrics.half_days || 0),
          overtimeHours,
          overtimeAmount,
          0,
          0,
          0,
          0,
          0,
          absentDeduction,
          netSalary,
          "Generated",
          new Date().toISOString().slice(0, 10),
        ]
      );

      createdPayrolls.push(result.rows[0]);
    }

    return Response.json({ success: true, message: "Payroll generated successfully", data: createdPayrolls }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Payroll generate error:", error);
    return Response.json({ success: false, message: "Unable to generate payroll", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
