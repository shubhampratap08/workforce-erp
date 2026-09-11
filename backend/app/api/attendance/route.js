import { attendanceRecords } from "@/data/attendance";
import { workers } from "@/data/workers";
import { deployments } from "@/data/deployments";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search")?.toLowerCase() || "";
  const status = searchParams.get("status") || "";
  const date = searchParams.get("date") || "";

  let filteredRecords = [...attendanceRecords];

  if (search) {
    filteredRecords = filteredRecords.filter(
      (record) =>
        record.workerName.toLowerCase().includes(search) ||
        record.workerCode.toLowerCase().includes(search) ||
        record.clientName.toLowerCase().includes(search)
    );
  }

  if (status) {
    filteredRecords = filteredRecords.filter(
      (record) => record.status === status
    );
  }

  if (date) {
    filteredRecords = filteredRecords.filter(
      (record) => record.date === date
    );
  }

  filteredRecords.sort(
    (first, second) =>
      new Date(second.date) - new Date(first.date)
  );

  return Response.json(
    {
      success: true,
      message: "Attendance fetched successfully",
      data: filteredRecords,
    },
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.workerId || !body.date || !body.status) {
      return Response.json(
        {
          success: false,
          message: "Worker, date and attendance status are required",
          data: null,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const worker = workers.find(
      (item) => item.id === Number(body.workerId)
    );

    if (!worker) {
      return Response.json(
        {
          success: false,
          message: "Selected worker not found",
          data: null,
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    const workerDeployment = deployments.find(
      (deployment) =>
        deployment.workerId === worker.id &&
        deployment.status === "Active"
    );

    const existingAttendance = attendanceRecords.find(
      (record) =>
        record.workerId === worker.id &&
        record.date === body.date
    );

    if (existingAttendance) {
      return Response.json(
        {
          success: false,
          message: "Attendance for this worker and date already exists",
          data: null,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const overtimeHours = Number(body.overtimeHours || 0);

    if (overtimeHours < 0 || overtimeHours > 24) {
      return Response.json(
        {
          success: false,
          message: "Overtime hours must be between 0 and 24",
          data: null,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const newAttendance = {
      id: Date.now(),
      attendanceId: `ATT-${String(
        attendanceRecords.length + 1
      ).padStart(3, "0")}`,
      workerId: worker.id,
      workerCode: worker.workerId,
      workerName: worker.fullName,
      clientId: workerDeployment?.clientId || null,
      clientName:
        workerDeployment?.clientName || "Not Deployed",
      deploymentId: workerDeployment?.id || null,
      date: body.date,
      status: body.status,
      overtimeHours,
      shift:
        body.shift || workerDeployment?.shift || "Day",
      remarks: body.remarks || "",
    };

    attendanceRecords.push(newAttendance);

    return Response.json(
      {
        success: true,
        message: "Attendance added successfully",
        data: newAttendance,
      },
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch {
    return Response.json(
      {
        success: false,
        message: "Invalid attendance data",
        data: null,
      },
      {
        status: 400,
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