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
      whereClauses.push(`LOWER(w.full_name) LIKE LOWER('%' || $${index} || '%')`);
      values.push(search);
      index += 1;
    }

    if (status) {
      whereClauses.push(`p.payment_status = $${index}`);
      values.push(status);
      index += 1;
    }

    if (month) {
      whereClauses.push(`p.salary_month = $${index}`);
      values.push(month);
      index += 1;
    }

    const totalRows = await db.query(
      `SELECT COUNT(*)::int AS total FROM payrolls p LEFT JOIN workers w ON w.id = p.worker_id WHERE ${whereClauses.join(" AND ")}`,
      values
    );

    const rows = await db.query(
      `
        SELECT
          p.*,
          w.full_name AS "workerName",
          w.worker_id AS "workerId"
        FROM payrolls p
        LEFT JOIN workers w ON w.id = p.worker_id
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY p.id DESC
        LIMIT $${index} OFFSET $${index + 1}
      `,
      [...values, limit, (page - 1) * limit]
    );

    return Response.json(
      {
        success: true,
        message: "Payrolls fetched successfully",
        data: rows.rows,
        pagination: buildPagination(page, limit, totalRows.rows[0].total || 0),
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return Response.json({ success: false, message: "Unable to fetch payrolls", error: error.message, data: [] }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const workerId = Number(body.workerId);

    if (!workerId || !body.salaryMonth) {
      return Response.json({ success: false, message: "Worker and salary month are required", data: null }, { status: 400, headers: corsHeaders });
    }

    const payrollId = `PAY-${Date.now()}`;
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
        RETURNING *
      `,
      [
        payrollId,
        workerId,
        body.salaryMonth,
        Number(body.basicSalary || 0),
        Number(body.workingDays || 0),
        Number(body.presentDays || 0),
        Number(body.absentDays || 0),
        Number(body.halfDays || 0),
        Number(body.overtimeHours || 0),
        Number(body.overtimeAmount || 0),
        Number(body.bonus || 0),
        Number(body.advanceDeduction || 0),
        Number(body.pfDeduction || 0),
        Number(body.esiDeduction || 0),
        Number(body.otherDeduction || 0),
        Number(body.absentDeduction || 0),
        Number(body.netSalary || 0),
        body.paymentStatus || "Draft",
        body.paymentDate || null,
      ]
    );

    return Response.json({ success: true, message: "Payroll created successfully", data: result.rows[0] }, { status: 201, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to create payroll", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
