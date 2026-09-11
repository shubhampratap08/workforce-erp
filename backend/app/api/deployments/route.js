import { deployments } from "@/data/deployments";
import { workers } from "@/data/workers";
import { clients } from "@/data/client";
import { jobs } from "@/data/jobs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search")?.toLowerCase() || "";
  const status = searchParams.get("status") || "";

  let filteredDeployments = [...deployments];

  if (search) {
    filteredDeployments = filteredDeployments.filter(
      (deployment) =>
        deployment.workerName.toLowerCase().includes(search) ||
        deployment.clientName.toLowerCase().includes(search) ||
        deployment.jobTitle.toLowerCase().includes(search) ||
        deployment.workLocation.toLowerCase().includes(search)
    );
  }

  if (status) {
    filteredDeployments = filteredDeployments.filter(
      (deployment) => deployment.status === status
    );
  }

  return Response.json(
    {
      success: true,
      message: "Deployments fetched successfully",
      data: filteredDeployments,
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

    if (
      !body.workerId ||
      !body.clientId ||
      !body.jobId ||
      !body.workLocation ||
      !body.deploymentDate
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Worker, client, job, location and deployment date are required",
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

    const client = clients.find(
      (item) => item.id === Number(body.clientId)
    );

    const job = jobs.find(
      (item) => item.id === Number(body.jobId)
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

    if (!client) {
      return Response.json(
        {
          success: false,
          message: "Selected client not found",
          data: null,
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    if (!job) {
      return Response.json(
        {
          success: false,
          message: "Selected job requirement not found",
          data: null,
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    if (worker.status !== "Available") {
      return Response.json(
        {
          success: false,
          message: "Only available workers can be deployed",
          data: null,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const activeDeployment = deployments.find(
      (deployment) =>
        deployment.workerId === Number(body.workerId) &&
        deployment.status === "Active"
    );

    if (activeDeployment) {
      return Response.json(
        {
          success: false,
          message: "Worker already has an active deployment",
          data: null,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const newDeployment = {
      id: Date.now(),
      deploymentId: `DEP-${String(
        deployments.length + 1
      ).padStart(3, "0")}`,
      workerId: worker.id,
      workerCode: worker.workerId,
      workerName: worker.fullName,
      clientId: client.id,
      clientName: client.companyName,
      jobId: job.id,
      requirementId: job.requirementId,
      jobTitle: job.jobTitle,
      workLocation: body.workLocation,
      deploymentDate: body.deploymentDate,
      shift: body.shift || job.shift || "Day",
      salary: Number(body.salary || worker.salary),
      billingRate: Number(body.billingRate || 0),
      supervisorName: body.supervisorName || "",
      contractStartDate: body.contractStartDate || "",
      contractEndDate: body.contractEndDate || "",
      status: body.status || "Active",
    };

    deployments.push(newDeployment);

    worker.status = "Deployed";

    return Response.json(
      {
        success: true,
        message: "Worker deployed successfully",
        data: newDeployment,
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
        message: "Invalid deployment data",
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