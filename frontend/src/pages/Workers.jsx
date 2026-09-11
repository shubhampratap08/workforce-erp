import { useEffect, useState } from "react";
import "../App.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  gender: "",
  category: "",
  skills: "",
  workLocation: "",
  salary: "",
  joiningDate: "",
  status: "Available",
};

function Workers() {
  const [workers, setWorkers] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchWorkers = async () => {
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
        `${API_URL}/workers?${query.toString()}`
      );

      const result = await response.json();

      if (result.success) {
        setWorkers(result.data);
      } else {
        setMessage(result.message);
      }
    } catch {
      setMessage("Workers API se connection nahi ho pa raha.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkers();
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
      ? `${API_URL}/workers/${editingId}`
      : `${API_URL}/workers`;

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

      setMessage(
        editingId
          ? "Worker successfully update ho gaya."
          : "Worker successfully add ho gaya."
      );

      setFormData(initialForm);
      setEditingId(null);
      fetchWorkers();
    } catch {
      setMessage("Workers API se connection nahi ho pa raha.");
    }
  };

  const handleEdit = (worker) => {
    setEditingId(worker.id);

    setFormData({
      fullName: worker.fullName || "",
      phone: worker.phone || "",
      email: worker.email || "",
      gender: worker.gender || "",
      category: worker.category || "",
      skills: worker.skills || "",
      workLocation: worker.workLocation || "",
      salary: worker.salary || "",
      joiningDate: worker.joiningDate || "",
      status: worker.status || "Available",
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

  const handleDelete = async (workerId) => {
    const confirmed = window.confirm(
      "Kya aap is worker ko delete karna chahte hain?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/workers/${workerId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Worker delete nahi hua.");
        return;
      }

      setMessage("Worker successfully delete ho gaya.");

      if (editingId === workerId) {
        handleCancel();
      }

      fetchWorkers();
    } catch {
      setMessage("Workers API se connection nahi ho pa raha.");
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <h1>Workers Management</h1>
        <p>Add and manage manpower workers</p>
      </div>

      {message && <div className="message">{message}</div>}

      <section className="card">
        <h2>
          {editingId ? "Edit Worker" : "Add New Worker"}
        </h2>

        <form onSubmit={handleSubmit} className="client-form">
          <input
            name="fullName"
            placeholder="Full name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="10-digit phone number"
            value={formData.phone}
            onChange={handleChange}
            maxLength="10"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input
            name="category"
            placeholder="Worker category"
            value={formData.category}
            onChange={handleChange}
            required
          />

          <input
            name="skills"
            placeholder="Skills"
            value={formData.skills}
            onChange={handleChange}
          />

          <input
            name="workLocation"
            placeholder="Work location"
            value={formData.workLocation}
            onChange={handleChange}
          />

          <input
            type="number"
            name="salary"
            placeholder="Monthly salary"
            value={formData.salary}
            onChange={handleChange}
            min="1"
            required
          />

          <input
            type="date"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Available">Available</option>
            <option value="Deployed">Deployed</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div className="form-buttons">
            <button type="submit">
              {editingId ? "Update Worker" : "Add Worker"}
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
          <h2>Worker List</h2>

          <div className="list-filters">
            <input
              type="search"
              placeholder="Search workers..."
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
              <option value="Available">Available</option>
              <option value="Deployed">Deployed</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading workers...</p>
        ) : workers.length === 0 ? (
          <p>No workers found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Worker ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {workers.map((worker, index) => (
                  <tr key={worker.id}>
                    <td>{index + 1}</td>
                    <td>{worker.workerId}</td>
                    <td>{worker.fullName}</td>
                    <td>{worker.phone}</td>
                    <td>{worker.category}</td>
                    <td>{worker.workLocation || "-"}</td>
                    <td>
                      ₹{Number(worker.salary).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span
                        className={`status ${worker.status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {worker.status}
                      </span>
                    </td>

                    <td className="action-buttons">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => handleEdit(worker)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDelete(worker.id)}
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

export default Workers;