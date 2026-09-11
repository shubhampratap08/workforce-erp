import { db } from "@/lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const workerColumns = `
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
`;

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const result = await db.query(
      `SELECT ${workerColumns} FROM workers WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Worker not found",
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
        message: "Worker fetched successfully",
        data: result.rows[0],
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("GET worker error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to fetch worker",
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

    const result = await db.query(
      `
      UPDATE workers
      SET
        full_name = $1,
        phone = $2,
        email = $3,
        gender = $4,
        category = $5,
        skills = $6,
        work_location = $7,
        salary = $8,
        joining_date = $9,
        status = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING ${workerColumns}
      `,
      [
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
        id,
      ]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Worker not found",
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
        message: "Worker updated successfully",
        data: result.rows[0],
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("PUT worker error:", error);

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
        message: "Unable to update worker",
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
      DELETE FROM workers
      WHERE id = $1
      RETURNING
        id,
        worker_id AS "workerId",
        full_name AS "fullName"
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Worker not found",
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
        message: "Worker deleted successfully",
        data: result.rows[0],
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("DELETE worker error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to delete worker",
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