import { db } from "@/lib/db";
import { corsHeaders } from "@/lib/api-helpers";

const baseSelect = `
  SELECT
    a.id,
    a.attendance_id AS "attendanceId",
    a.worker_id AS "workerId",
    w.full_name AS "workerName",
    a.deployment_id AS "deploymentId",
    a.client_id AS "clientId",
    c.company_name AS "clientName",
    a.attendance_date AS "attendanceDate",
    a.attendance_status AS "attendanceStatus",
    a.overtime_hours AS "overtimeHours",
    a.shift,
    a.remarks,
    a.created_at AS "createdAt",
    a.updated_at AS "updatedAt"
  FROM attendance a
  LEFT JOIN workers w ON w.id = a.worker_id
  LEFT JOIN clients c ON c.id = a.client_id
  WHERE a.id = $1
`;

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await db.query(baseSelect, [id]);

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Attendance record not found", data: null }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ success: true, message: "Attendance fetched successfully", data: result.rows[0] }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to fetch attendance record", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const overtimeHours = Number(body.overtimeHours || 0);

    if (overtimeHours < 0 || overtimeHours > 24) {
      return Response.json({ success: false, message: "Overtime hours must be between 0 and 24", data: null }, { status: 400, headers: corsHeaders });
    }

    const result = await db.query(
      `
        UPDATE attendance
        SET
          worker_id = COALESCE($1, worker_id),
          deployment_id = COALESCE($2, deployment_id),
          client_id = COALESCE($3, client_id),
          attendance_date = COALESCE($4, attendance_date),
          attendance_status = COALESCE($5, attendance_status),
          overtime_hours = COALESCE($6, overtime_hours),
          shift = COALESCE($7, shift),
          remarks = COALESCE($8, remarks),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
      `,
      [
        body.workerId ? Number(body.workerId) : null,
        body.deploymentId ? Number(body.deploymentId) : null,
        body.clientId ? Number(body.clientId) : null,
        body.attendanceDate || null,
        body.attendanceStatus || null,
        overtimeHours,
        body.shift || null,
        body.remarks || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Attendance record not found", data: null }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ success: true, message: "Attendance updated successfully", data: result.rows[0] }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to update attendance record", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await db.query("DELETE FROM attendance WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Attendance record not found", data: null }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ success: true, message: "Attendance deleted successfully", data: { id } }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, message: "Unable to delete attendance record", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
