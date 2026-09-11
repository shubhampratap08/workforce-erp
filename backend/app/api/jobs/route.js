import { db } from "@/lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const result = await db.query(
      `
      SELECT ${jobColumns}
      FROM jobs
      WHERE (
        $1 = ''
        OR LOWER(requirement_id) LIKE LOWER('%' || $1 || '%')
        OR LOWER(client_name) LIKE LOWER('%' || $1 || '%')
        OR LOWER(job_title) LIKE LOWER('%' || $1 || '%')
        OR LOWER(work_location) LIKE LOWER('%' || $1 || '%')
      )
      AND ($2 = '' OR status = $2)
      ORDER BY id DESC
      `,
      [search, status]
    );

    return Response.json(
      {
        success: true,
        message: "Job requirements fetched successfully",
        data: result.rows,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("GET jobs error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to fetch job requirements",
        data: [],
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function POST(request) {
  try {
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

    const requirementId = `JOB-${Date.now()}`;

    const result = await db.query(
      `
      INSERT INTO jobs (
        requirement_id,
        client_name,
        job_title,
        worker_category,
        workers_required,
        skills_required,
        work_location,
        shift,
        salary_offered,
        start_date,
        end_date,
        status,
        description
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13
      )
      RETURNING ${jobColumns}
      `,
      [
        requirementId,
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
      ]
    );

    return Response.json(
      {
        success: true,
        message: "Job requirement created successfully",
        data: result.rows[0],
      },
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("POST job error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to create job requirement",
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