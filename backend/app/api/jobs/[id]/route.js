import { db } from "@/lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const jobColumns = `
  id,
  requirement_id AS "requirementId",
  client_name AS "clientName",
  job_title AS "jobTitle",
  worker_category AS "workerCategory",
  workers_required AS "workersRequired",
  skills_required AS "skillsRequired",
  work_location AS "workLocation",
  shift,
  salary_offered AS "salaryOffered",
  start_date AS "startDate",
  end_date AS "endDate",
  status,
  description,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const result = await db.query(
      `SELECT ${jobColumns} FROM jobs WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Job requirement not found",
          data: null,
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Job requirement fetched successfully",
        data: result.rows[0],
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("GET job error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to fetch job requirement",
        data: null,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const clientName = body.clientName?.trim();
    const jobTitle = body.jobTitle?.trim();
    const workLocation = body.workLocation?.trim();
    const workersRequired = Number(body.workersRequired);
    const salaryOffered = Number(body.salaryOffered);

    if (
      !clientName ||
      !jobTitle ||
      !workLocation ||
      !workersRequired ||
      !salaryOffered
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Client, job title, workers, location and salary are required",
          data: null,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (workersRequired <= 0 || salaryOffered <= 0) {
      return Response.json(
        {
          success: false,
          message: "Workers and salary must be greater than zero",
          data: null,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (
      body.startDate &&
      body.endDate &&
      new Date(body.endDate) < new Date(body.startDate)
    ) {
      return Response.json(
        {
          success: false,
          message: "End date cannot be before start date",
          data: null,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const result = await db.query(
      `
      UPDATE jobs
      SET
        client_name = $1,
        job_title = $2,
        worker_category = $3,
        workers_required = $4,
        skills_required = $5,
        work_location = $6,
        shift = $7,
        salary_offered = $8,
        start_date = $9,
        end_date = $10,
        status = $11,
        description = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING ${jobColumns}
      `,
      [
        clientName,
        jobTitle,
        body.workerCategory?.trim() || null,
        workersRequired,
        body.skillsRequired?.trim() || null,
        workLocation,
        body.shift || "Day",
        salaryOffered,
        body.startDate || null,
        body.endDate || null,
        body.status || "Open",
        body.description?.trim() || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Job requirement not found",
          data: null,
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Job requirement updated successfully",
        data: result.rows[0],
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("PUT job error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to update job requirement",
        data: null,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const result = await db.query(
      `
      DELETE FROM jobs
      WHERE id = $1
      RETURNING
        id,
        requirement_id AS "requirementId",
        job_title AS "jobTitle"
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Job requirement not found",
          data: null,
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Job requirement deleted successfully",
        data: result.rows[0],
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("DELETE job error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to delete job requirement",
        data: null,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}