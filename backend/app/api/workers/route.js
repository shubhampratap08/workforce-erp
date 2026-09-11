import { db } from "@/lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const result = await db.query(
      `
      SELECT
        id,
        worker_id AS "workerId",
        full_name AS "fullName",
        phone,
        email,
        gender,
        category,
        skills,
        work_location AS "workLocation",
        salary,
        joining_date AS "joiningDate",
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM workers
      WHERE (
        $1 = ''
        OR LOWER(worker_id) LIKE LOWER('%' || $1 || '%')
        OR LOWER(full_name) LIKE LOWER('%' || $1 || '%')
        OR phone LIKE '%' || $1 || '%'
        OR LOWER(category) LIKE LOWER('%' || $1 || '%')
        OR LOWER(COALESCE(work_location, ''))
           LIKE LOWER('%' || $1 || '%')
      )
      AND ($2 = '' OR status = $2)
      ORDER BY id DESC
      `,
      [search, status]
    );

    return Response.json(
      {
        success: true,
        message: "Workers fetched successfully",
        data: result.rows,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("GET workers error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to fetch workers",
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

    const fullName = body.fullName?.trim();
    const phone = body.phone?.trim();
    const category = body.category?.trim();
    const salary = Number(body.salary);

    if (!fullName || !phone || !category || !salary) {
      return Response.json(
        {
          success: false,
          message: "Name, phone, category and salary are required",
          data: null,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return Response.json(
        {
          success: false,
          message: "Enter a valid 10-digit phone number",
          data: null,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (salary <= 0) {
      return Response.json(
        {
          success: false,
          message: "Salary must be greater than zero",
          data: null,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const workerId = `WRK-${Date.now()}`;

    const result = await db.query(
      `
      INSERT INTO workers (
        worker_id,
        full_name,
        phone,
        email,
        gender,
        category,
        skills,
        work_location,
        salary,
        joining_date,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING
        id,
        worker_id AS "workerId",
        full_name AS "fullName",
        phone,
        email,
        gender,
        category,
        skills,
        work_location AS "workLocation",
        salary,
        joining_date AS "joiningDate",
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        workerId,
        fullName,
        phone,
        body.email?.trim() || null,
        body.gender || null,
        category,
        body.skills?.trim() || null,
        body.workLocation?.trim() || null,
        salary,
        body.joiningDate || null,
        body.status || "Available",
      ]
    );

    return Response.json(
      {
        success: true,
        message: "Worker created successfully",
        data: result.rows[0],
      },
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("POST worker error:", error);

    if (error.code === "23505") {
      return Response.json(
        {
          success: false,
          message: "This phone number is already registered",
          data: null,
        },
        {
          status: 409,
          headers: corsHeaders,
        }
      );
    }

    return Response.json(
      {
        success: false,
        message: "Unable to create worker",
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