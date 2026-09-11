import { useEffect, useState } from "react";
import "../App.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialForm = {
  clientName: "",
  jobTitle: "",
  workerCategory: "",
  workersRequired: "",
  skillsRequired: "",
  workLocation: "",
  shift: "Day",
  salaryOffered: "",
  startDate: "",
  endDate: "",
  status: "Open",
  description: "",
};

function JobRequirements() {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchJobs = async () => {
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
        `${API_URL}/jobs?${query.toString()}`
      );

      const result = await response.json();

      if (result.success) {
        setJobs(result.data);
      } else {
        setMessage(result.message);
      }
    } catch {
      setMessage("Jobs API se connection nahi ho pa raha.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const url = editingId
      ? `${API_URL}/jobs/${editingId}`
      : `${API_URL}/jobs`;

    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Operation failed.");
        return;
      }

      if (editingId) {
        setMessage("Job requirement successfully update ho gayi.");
      } else {
        setMessage("Job requirement successfully add ho gayi.");
      }

      setFormData(initialForm);
      setEditingId(null);
      fetchJobs();
    } catch {
      setMessage("Jobs API se connection nahi ho pa raha.");
    }
  };

  const handleEdit = (job) => {
    setEditingId(job.id);

    setFormData({
      clientName: job.clientName || "",
      jobTitle: job.jobTitle || "",
      workerCategory: job.workerCategory || "",
      workersRequired: job.workersRequired || "",
      skillsRequired: job.skillsRequired || "",
      workLocation: job.workLocation || "",
      shift: job.shift || "Day",
      salaryOffered: job.salaryOffered || "",
      startDate: job.startDate || "",
      endDate: job.endDate || "",
      status: job.status || "Open",
      description: job.description || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(initialForm);
    setMessage("");
  };

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm(
      "Kya aap is job requirement ko delete karna chahte hain?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Job requirement delete nahi hui.");
        return;
      }

      setMessage("Job requirement successfully delete ho gayi.");

      if (editingId === jobId) {
        setEditingId(null);
        setFormData(initialForm);
      }

      fetchJobs();
    } catch {
      setMessage("Jobs API se connection nahi ho pa raha.");
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <h1>Job Requirements</h1>
        <p>Manage corporate manpower requirements</p>
      </div>

      {message && <div className="message">{message}</div>}

      <section className="card">
        <h2>
          {editingId
            ? "Edit Job Requirement"
            : "Add Job Requirement"}
        </h2>

        <form onSubmit={handleSubmit} className="client-form">
          <input
            name="clientName"
            placeholder="Client company name"
            value={formData.clientName}
            onChange={handleChange}
            required
          />

          <input
            name="jobTitle"
            placeholder="Job title"
            value={formData.jobTitle}
            onChange={handleChange}
            required
          />

          <input
            name="workerCategory"
            placeholder="Worker category"
            value={formData.workerCategory}
            onChange={handleChange}
          />

          <input
            type="number"
            name="workersRequired"
            placeholder="Number of workers required"
            value={formData.workersRequired}
            onChange={handleChange}
            min="1"
            required
          />

          <input
            name="skillsRequired"
            placeholder="Skills required"
            value={formData.skillsRequired}
            onChange={handleChange}
          />

          <input
            name="workLocation"
            placeholder="Work location"
            value={formData.workLocation}
            onChange={handleChange}
            required
          />

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
            name="salaryOffered"
            placeholder="Monthly salary offered"
            value={formData.salaryOffered}
            onChange={handleChange}
            min="1"
            required
          />

          <div className="date-field">
            <label>Start date</label>

            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="date-field">
            <label>End date</label>

            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Filled">Filled</option>
            <option value="Closed">Closed</option>
          </select>

          <textarea
            name="description"
            placeholder="Job description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />

          <div className="form-buttons">
            <button type="submit">
              {editingId
                ? "Update Requirement"
                : "Add Requirement"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="list-header">
          <h2>Job Requirement List</h2>

          <div className="list-filters">
            <input
              type="search"
              placeholder="Search jobs..."
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
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Filled">Filled</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading job requirements...</p>
        ) : jobs.length === 0 ? (
          <p>No job requirements found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Requirement ID</th>
                  <th>Client</th>
                  <th>Job Title</th>
                  <th>Workers</th>
                  <th>Location</th>
                  <th>Shift</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {jobs.map((job, index) => (
                  <tr key={job.id}>
                    <td>{index + 1}</td>
                    <td>{job.requirementId}</td>
                    <td>{job.clientName}</td>
                    <td>{job.jobTitle}</td>
                    <td>{job.workersRequired}</td>
                    <td>{job.workLocation}</td>
                    <td>{job.shift}</td>
                    <td>
                      ₹
                      {Number(job.salaryOffered).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td>
                      <span
                        className={`status ${job.status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td className="action-buttons">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => handleEdit(job)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDelete(job.id)}
                      >
                        Delete
                      </button>
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

export default JobRequirements;