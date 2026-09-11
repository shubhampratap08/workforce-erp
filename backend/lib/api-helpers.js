export const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function normalizePagination(searchParams) {
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
  };
}

export function buildPagination(currentPage, limit, totalRecords) {
  const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / limit) : 1;

  return {
    currentPage: currentPage,
    totalPages,
    totalRecords,
    limit,
  };
}

export function makeErrorResponse(message, details = null, status = 500) {
  return Response.json(
    {
      success: false,
      message,
      error: details,
      data: null,
    },
    {
      status,
      headers: corsHeaders,
    }
  );
}

export function formatMoney(value) {
  return Number(value || 0);
}

export function getStatusBadgeClass(status) {
  if (!status) {
    return "neutral";
  }

  return String(status).toLowerCase().replace(/\s+/g, "-");
}
