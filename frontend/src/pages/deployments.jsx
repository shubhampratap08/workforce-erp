import { useEffect, useState } from "react";
import "../App.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialForm = {
  workerId: "",
  clientId: "",
  jobId: "",
  workLocation: "",
  deploymentDate: "",
  shift: "Day",
  salary: "",
  billingRate: "",
  supervisorName: "",
  contractStartDate: "",
  contractEndDate: "",
  status: "Active",
};

function Deployments() {
  const [deployments, setDeployments] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchDeployments = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams();

      if (search) {
        query.append("search", search);
      }

      if (statusFilter) {
        query.append("status", statusFilter);
      }

      const response = await fetch(
        `${API_URL}/deployments?${query.toString()}`
      );

      const result = await response.json();

      if (result.success) {
        setDeployments(result.data);
      } else {
        setMessage(result.message);
      }
    } catch {
      setMessage("Deployments API se connection nahi ho pa raha.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [workersResponse, clientsResponse, jobsResponse] =
        await Promise.all([
          fetch(`${API_URL}/workers`),
          fetch(`${API_URL}/clients`),
          fetch(`${API_URL}/jobs`),
        ]);

      const [workersResult, clientsResult, jobsResult] =
        await Promise.all([
          workersResponse.json(),
          clientsResponse.json(),
          jobsResponse.json(),
        ]);

      setWorkers(
        (workersResult.data || []).filter(
          (worker) => worker.status === "Available"
        )
      );

      setClients(
        (clientsResult.data || []).filter(
          (client) => client.status === "Active"
        )
      );

      setJobs(
        (jobsResult.data || []).filter(
          (job) =>
            job.status === "Open" ||
            job.status === "In Progress"
        )
      );
    } catch {
      setMessage("Form data load nahi ho pa raha.");
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDeployments();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "workerId") {
      const selectedWorker = workers.find(
        (worker) => worker.id === Number(value)
      );

      if (selectedWorker) {
        setFormData((previous) => ({
          ...previous,
          workerId: value,
          salary: selectedWorker.salary || "",
        }));
      }
    }

    if (name === "jobId") {
      const selectedJob = jobs.find(
        (job) => job.id === Number(value)
      );

      if (selectedJob) {
        setFormData((previous) => ({
          ...previous,
          jobId: value,
          workLocation: selectedJob.workLocation || "",
          shift: selectedJob.shift || "Day",
        }));
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/deployments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Deployment create nahi hua.");
        return;
      }

      setMessage("Worker successfully deploy ho gaya.");
      setFormData(initialForm);

      await fetchDeployments();
      await fetchDropdownData();
    } catch {
      setMessage("Deployments API se connection nahi ho pa raha.");
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <h1>Worker Deployments</h1>
        <p>Assign available workers to clients and jobs</p>
      </div>

      {message && <div className="message">{message}</div>}

      <section className="card">
        <h2>Create New Deployment</h2>

        <form onSubmit={handleSubmit} className="client-form">
          <select
            name="workerId"
            value={formData.workerId}
            onChange={handleChange}
            required
          >
            <option value="">Select available worker</option>

            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.workerId} - {worker.fullName}
              </option>
            ))}
          </select>

          <select
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            required
          >
            <option value="">Select client</option>

            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>

          <select
            name="jobId"
            value={formData.jobId}
            onChange={handleChange}
            required
          >
            <option value="">Select job requirement</option>

            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.requirementId} - {job.jobTitle}
              </option>
            ))}
          </select>

          <input
            name="workLocation"
            placeholder="Work location"
            value={formData.workLocation}
            onChange={handleChange}
            required
          />

          <div className="date-field">
            <label>Deployment date</label>

            <input
              type="date"
              name="deploymentDate"
              value={formData.deploymentDate}
              onChange={handleChange}
              required
            />
          </div>

          <select
            name="shift"
            value={formData.shift}
            onChange={handleChange}
          >
            <option value="Day">Day Shift</option>
            <option value="Night">Night Shift</option>
            <option value="Rotational">Rotational Shift</option>
          </select>

          <input
            type="number"
            name="salary"
            placeholder="Worker salary"
            value={formData.salary}
            onChange={handleChange}
            min="0"
          />

          <input
            type="number"
            name="billingRate"
            placeholder="Client billing rate"
            value={formData.billingRate}
            onChange={handleChange}
            min="0"
          />

          <input
            name="supervisorName"
            placeholder="Supervisor name"
            value={formData.supervisorName}
            onChange={handleChange}
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Terminated">Terminated</option>
          </select>

          <div className="date-field">
            <label>Contract start date</label>

            <input
              type="date"
              name="contractStartDate"
              value={formData.contractStartDate}
              onChange={handleChange}
            />
          </div>

          <div className="date-field">
            <label>Contract end date</label>

            <input
              type="date"
              name="contractEndDate"
              value={formData.contractEndDate}
              onChange={handleChange}
            />
          </div>

          <button type="submit">Deploy Worker</button>
        </form>
      </section>

      <section className="card">
        <div className="list-header">
          <h2>Deployment List</h2>

          <div className="list-filters">
            <input
              type="search"
              placeholder="Search deployments..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="">All statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading deployments...</p>
        ) : deployments.length === 0 ? (
          <p>No deployments found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Deployment ID</th>
                  <th>Worker</th>
                  <th>Client</th>
                  <th>Job</th>
                  <th>Location</th>
                  <th>Shift</th>
                  <th>Salary</th>
                  <th>Billing Rate</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {deployments.map((deployment, index) => (
                  <tr key={deployment.id}>
                    <td>{index + 1}</td>
                    <td>{deployment.deploymentId}</td>
                    <td>{deployment.workerName}</td>
                    <td>{deployment.clientName}</td>
                    <td>{deployment.jobTitle}</td>
                    <td>{deployment.workLocation}</td>
                    <td>{deployment.shift}</td>
                    <td>
                      ₹
                      {Number(deployment.salary).toLocaleString(
                        "en-IN"
                      )}
                    </td>
                    <td>
                      ₹
                      {Number(
                        deployment.billingRate
                      ).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span
                        className={`status ${deployment.status.toLowerCase()}`}
                      >
                        {deployment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Deployments;