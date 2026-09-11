import { useEffect, useState } from "react";
import "../App.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/assets`);
      const result = await response.json();
      if (response.ok && result.success) setAssets(result.data || []);
      else setMessage(result.message || "Unable to load assets.");
    } catch (error) {
      setMessage(error.message || "Assets API is unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <div className="page">
      <div className="page-heading">
        <h1>Assets</h1>
        <p>Track company equipment, assignments, and returns</p>
      </div>

      {message && <div className="message">{message}</div>}

      <section className="card">
        <h2>Asset Register</h2>
        {loading ? <div className="empty-state">Loading assets...</div> : assets.length === 0 ? <div className="empty-state">No assets found.</div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Asset</th><th>Category</th><th>Serial</th><th>Status</th><th>Assigned To</th><th>Location</th></tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.assetName || asset.name || "-"}</td>
                    <td>{asset.category || "-"}</td>
                    <td>{asset.serialNumber || asset.serial_no || "-"}</td>
                    <td><span className={`status ${String(asset.status || "").toLowerCase().replace(/\s+/g, "-")}`}>{asset.status}</span></td>
                    <td>{asset.assignedTo || asset.workerName || "-"}</td>
                    <td>{asset.location || "-"}</td>
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

export default Assets;
