import { db } from "@/lib/db";
import { corsHeaders } from "@/lib/api-helpers";

const selectQuery = `
  SELECT
    d.id,
    d.deployment_id AS "deploymentId",
    d.worker_id AS "workerId",
    w.full_name AS "workerName",
    d.client_id AS "clientId",
    c.company_name AS "clientName",
    d.job_id AS "jobId",
    j.job_title AS "jobTitle",
    d.work_location AS "workLocation",
    d.deployment_date AS "deploymentDate",
    d.shift,
    d.salary,
    d.billing_rate AS "billingRate",
    d.supervisor_name AS "supervisorName",
    d.contract_start_date AS "contractStartDate",
    d.contract_end_date AS "contractEndDate",
    d.status,
    d.created_at AS "createdAt",
    d.updated_at AS "updatedAt"
  FROM deployments d
  LEFT JOIN workers w ON w.id = d.worker_id
  LEFT JOIN clients c ON c.id = d.client_id
  LEFT JOIN jobs j ON j.id = d.job_id
  WHERE d.id = $1
`;

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await db.query(selectQuery, [id]);

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: "Deployment not found", data: null }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ success: true, message: "Deployment fetched successfully", data: result.rows[0] }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("GET deployment error:", error);
    return Response.json({ success: false, message: "Unable to fetch deployment", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const nextStatus = body.status || "Active";

    const existing = await db.query(selectQuery, [id]);
    if (existing.rows.length === 0) {
      return Response.json({ success: false, message: "Deployment not found", data: null }, { status: 404, headers: corsHeaders });
    }

    const deployment = existing.rows[0];
    const workerId = Number(body.workerId ?? deployment.workerId);

    if (nextStatus === "Active" && workerId) {
      const activeCheck = await db.query("SELECT id FROM deployments WHERE worker_id = $1 AND status = 'Active' AND id != $2", [workerId, id]);
      if (activeCheck.rows.length > 0) {
        return Response.json({ success: false, message: "A worker cannot have two active deployments", data: null }, { status: 409, headers: corsHeaders });
      }
    }

    const result = await db.query(
      `
        UPDATE deployments
        SET
          worker_id = COALESCE($1, worker_id),
          client_id = COALESCE($2, client_id),
          job_id = COALESCE($3, job_id),
          work_location = COALESCE($4, work_location),
          deployment_date = COALESCE($5, deployment_date),
          shift = COALESCE($6, shift),
          salary = COALESCE($7, salary),
          billing_rate = COALESCE($8, billing_rate),
          supervisor_name = COALESCE($9, supervisor_name),
          contract_start_date = COALESCE($10, contract_start_date),
          contract_end_date = COALESCE($11, contract_end_date),
          status = $12,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $13
        RETURNING *
      `,
      [
        body.workerId ? Number(body.workerId) : null,
        body.clientId ? Number(body.clientId) : null,
        body.jobId ? Number(body.jobId) : null,
        body.workLocation || null,
        body.deploymentDate || null,
        body.shift || null,
        body.salary !== undefined ? Number(body.salary) : null,
        body.billingRate !== undefined ? Number(body.billingRate) : null,
        body.supervisorName || null,
        body.contractStartDate || null,
        body.contractEndDate || null,
        nextStatus,
        id,
      ]
    );

    if (nextStatus === "Active") {
      await db.query("UPDATE workers SET status = 'Deployed', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [workerId]);
    }

    if (nextStatus === "Completed" || nextStatus === "Terminated") {
      await db.query("UPDATE workers SET status = 'Available', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [deployment.workerId]);
    }

    return Response.json({ success: true, message: "Deployment updated successfully", data: result.rows[0] }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("PUT deployment error:", error);
    return Response.json({ success: false, message: "Unable to update deployment", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const existing = await db.query("SELECT worker_id, status FROM deployments WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return Response.json({ success: false, message: "Deployment not found", data: null }, { status: 404, headers: corsHeaders });
    }

    const deployment = existing.rows[0];
    await db.query("DELETE FROM deployments WHERE id = $1", [id]);

    if (deployment.status === "Active") {
      await db.query("UPDATE workers SET status = 'Available', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [deployment.worker_id]);
    }

    return Response.json({ success: true, message: "Deployment deleted successfully", data: { id } }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("DELETE deployment error:", error);
    return Response.json({ success: false, message: "Unable to delete deployment", error: error.message, data: null }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
