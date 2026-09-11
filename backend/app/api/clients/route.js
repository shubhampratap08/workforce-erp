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
        WHERE (
          $1 = ''
          OR LOWER(company_name) LIKE LOWER('%' || $1 || '%')
          OR LOWER(contact_person) LIKE LOWER('%' || $1 || '%')
          OR LOWER(COALESCE(email, '')) LIKE LOWER('%' || $1 || '%')
          OR phone LIKE '%' || $1 || '%'
        )
        AND ($2 = '' OR status = $2)
        ORDER BY id DESC
      `,
      [search, status]
    );

    return Response.json(
      {
        success: true,
        message: "Clients fetched successfully",
        data: result.rows,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("GET clients error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to fetch clients",
        error: error.message,
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

    const companyName = body.companyName?.trim();
    const contactPerson = body.contactPerson?.trim();
    const phone = body.phone?.trim();

    if (!companyName || !contactPerson || !phone) {
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
        INSERT INTO clients (
          company_name,
          contact_person,
          email,
          phone,
          work_location,
          payment_terms,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
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
        companyName,
        contactPerson,
        body.email?.trim() || null,
        phone,
        body.workLocation?.trim() || null,
        body.paymentTerms?.trim() || null,
        body.status || "Active",
      ]
    );

    return Response.json(
      {
        success: true,
        message: "Client created successfully",
        data: result.rows[0],
      },
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("POST client error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to create client",
        error: error.message,
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