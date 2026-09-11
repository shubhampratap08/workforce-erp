import { db } from "@/lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET() {
  try {
    const [clients, workers, jobs, payroll, invoices, sales, purchases, assets, recentDeployments, recentAttendance] = await Promise.all([
      db.query("SELECT COUNT(*)::int AS total FROM clients"),
      db.query("SELECT COUNT(*)::int AS total, SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END)::int AS available, SUM(CASE WHEN status = 'Deployed' THEN 1 ELSE 0 END)::int AS deployed FROM workers"),
      db.query("SELECT COUNT(*)::int AS total, SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END)::int AS open FROM jobs"),
      db.query("SELECT COALESCE(SUM(net_salary), 0)::numeric AS total_salary FROM payrolls WHERE salary_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')"),
      db.query("SELECT COUNT(*)::int AS total, SUM(CASE WHEN payment_status != 'Paid' THEN 1 ELSE 0 END)::int AS pending FROM invoices"),
      db.query("SELECT COALESCE(SUM(amount), 0)::numeric AS total FROM sales WHERE sale_date >= DATE_TRUNC('month', CURRENT_DATE)"),
      db.query("SELECT COALESCE(SUM(total_amount), 0)::numeric AS total FROM purchases WHERE purchase_date >= DATE_TRUNC('month', CURRENT_DATE)"),
      db.query("SELECT COUNT(*)::int AS total FROM assets"),
      db.query(`
        SELECT d.id, d.deployment_id AS "deploymentId", w.full_name AS "workerName", c.company_name AS "clientName", d.status, d.deployment_date AS "deploymentDate"
        FROM deployments d
        LEFT JOIN workers w ON w.id = d.worker_id
        LEFT JOIN clients c ON c.id = d.client_id
        ORDER BY d.created_at DESC
        LIMIT 5
      `),
      db.query(`
        SELECT a.id, a.attendance_id AS "attendanceId", w.full_name AS "workerName", a.attendance_date AS "attendanceDate", a.attendance_status AS "attendanceStatus"
        FROM attendance a
        LEFT JOIN workers w ON w.id = a.worker_id
        ORDER BY a.attendance_date DESC, a.created_at DESC
        LIMIT 5
      `),
    ]);

    return Response.json(
      {
        success: true,
        message: "Summary fetched successfully",
        data: {
          totals: {
            clients: Number(clients.rows[0].total || 0),
            workers: Number(workers.rows[0].total || 0),
            availableWorkers: Number(workers.rows[0].available || 0),
            deployedWorkers: Number(workers.rows[0].deployed || 0),
            openJobs: Number(jobs.rows[0].open || 0),
            monthlyPayroll: Number(payroll.rows[0].total_salary || 0),
            pendingInvoices: Number(invoices.rows[0].pending || 0),
            monthlySales: Number(sales.rows[0].total || 0),
            monthlyPurchases: Number(purchases.rows[0].total || 0),
            totalAssets: Number(assets.rows[0].total || 0),
          },
          recentDeployments: recentDeployments.rows,
          recentAttendance: recentAttendance.rows,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Summary fetch error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to fetch summary",
        error: error.message,
        data: null,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
