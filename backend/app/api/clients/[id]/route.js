import { db } from "@/lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const result = await db.query(
      `
        SELECT
          id,
          company_name AS "companyName",
          contact_person AS "contactPerson",
          email,
          phone,
          work_location AS "workLocation",
          payment_terms AS "paymentTerms",
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM clients
        WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Client not found",
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
        message: "Client fetched successfully",
        data: result.rows[0],
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("GET client error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to fetch client",
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

    if (!body.companyName || !body.contactPerson || !body.phone) {
      return Response.json(
        {
          success: false,
          message:
            "Company name, contact person and phone are required",
          data: null,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (!/^[6-9]\d{9}$/.test(body.phone)) {
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
        UPDATE clients
        SET
          company_name = $1,
          contact_person = $2,
          email = $3,
          phone = $4,
          work_location = $5,
          payment_terms = $6,
          status = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING
          id,
          company_name AS "companyName",
          contact_person AS "contactPerson",
          email,
          phone,
          work_location AS "workLocation",
          payment_terms AS "paymentTerms",
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [
        body.companyName.trim(),
        body.contactPerson.trim(),
        body.email?.trim() || null,
        body.phone,
        body.workLocation?.trim() || null,
        body.paymentTerms?.trim() || null,
        body.status || "Active",
        id,
      ]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Client not found",
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
        message: "Client updated successfully",
        data: result.rows[0],
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("PUT client error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to update client",
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
        DELETE FROM clients
        WHERE id = $1
        RETURNING id, company_name AS "companyName"
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Client not found",
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
        message: "Client deleted successfully",
        data: result.rows[0],
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("DELETE client error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to delete client",
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