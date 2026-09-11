import { useEffect, useState } from "react";
import "../App.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialFormData = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  workLocation: "",
  paymentTerms: "",
  status: "Active",
};

function Clients() {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchClients = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/clients`);
      const result = await response.json();

      if (result.success) {
        setClients(result.data);
      } else {
        setMessage(result.message);
      }
    } catch {
      setMessage("Backend API se connection nahi ho pa raha.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const url = editingId
      ? `${API_URL}/clients/${editingId}`
      : `${API_URL}/clients`;

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
        setClients((previousClients) =>
          previousClients.map((client) =>
            client.id === editingId ? result.data : client
          )
        );

        setMessage("Client successfully update ho gaya.");
      } else {
        setClients((previousClients) => [
          ...previousClients,
          result.data,
        ]);

        setMessage("Client successfully add ho gaya.");
      }

      setFormData(initialFormData);
      setEditingId(null);
    } catch {
      setMessage("Backend API se connection nahi ho pa raha.");
    }
  };

  const handleEdit = (client) => {
    setEditingId(client.id);

    setFormData({
      companyName: client.companyName || "",
      contactPerson: client.contactPerson || "",
      email: client.email || "",
      phone: client.phone || "",
      workLocation: client.workLocation || "",
      paymentTerms: client.paymentTerms || "",
      status: client.status || "Active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setMessage("");
  };

  const handleDelete = async (clientId) => {
    const confirmed = window.confirm(
      "Kya aap is client ko delete karna chahte hain?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/clients/${clientId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Client delete nahi hua.");
        return;
      }

      setClients((previousClients) =>
        previousClients.filter(
          (client) => client.id !== clientId
        )
      );

      if (editingId === clientId) {
        handleCancelEdit();
      }

      setMessage("Client successfully delete ho gaya.");
    } catch {
      setMessage("Backend API se connection nahi ho pa raha.");
    }
  };

  return (
    <div className="page">
      <h1>WorkForce ERP</h1>
      <p className="subtitle">Corporate Client Management</p>

      {message && <div className="message">{message}</div>}

      <section className="card">
        <h2>
          {editingId ? "Edit Client" : "Add New Client"}
        </h2>

        <form onSubmit={handleSubmit} className="client-form">
          <input
            type="text"
            name="companyName"
            placeholder="Company name"
            value={formData.companyName}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="contactPerson"
            placeholder="Contact person"
            value={formData.contactPerson}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="workLocation"
            placeholder="Work location"
            value={formData.workLocation}
            onChange={handleChange}
          />

          <input
            type="text"
            name="paymentTerms"
            placeholder="Payment terms"
            value={formData.paymentTerms}
            onChange={handleChange}
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div className="form-buttons">
            <button type="submit">
              {editingId ? "Update Client" : "Add Client"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Client List</h2>

        {loading ? (
          <p>Loading clients...</p>
        ) : clients.length === 0 ? (
          <p>No clients found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Company</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {clients.map((client, index) => (
                  <tr key={client.id}>
                    <td>{index + 1}</td>
                    <td>{client.companyName}</td>
                    <td>{client.contactPerson}</td>
                    <td>{client.email || "-"}</td>
                    <td>{client.phone}</td>
                    <td>{client.workLocation || "-"}</td>
                    <td>
                      <span
                        className={
                          client.status === "Active"
                            ? "status active"
                            : "status inactive"
                        }
                      >
                        {client.status}
                      </span>
                    </td>

                    <td className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(client)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => handleDelete(client.id)}
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
<h1>WorkForcenym ERP</h1>
export default Clients;