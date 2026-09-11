import { useEffect, useState } from "react";
import "../App.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, limit: 10 });

  const fetchWorkers = async () => {
    try {
      const response = await fetch(`${API_URL}/workers`);
      const result = await response.json();
      if (result.success) setWorkers(result.data || []);
    } catch {
      setMessage("Worker list could not load.");
    }
  };

  const fetchPayroll = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (monthFilter) params.set("month", monthFilter);
      params.set("page", String(page));
      params.set("limit", "10");

      const response = await fetch(`${API_URL}/payrolls?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setPayrolls(result.data || []);
        setPagination(result.pagination || { currentPage: page, totalPages: 1, totalRecords: 0, limit: 10 });
      } else {
        setMessage(result.message || "Unable to fetch payroll.");
      }
    } catch (error) {
      setMessage(error.message || "Payroll API is unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      const response = await fetch(`${API_URL}/payrolls/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: monthFilter }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Payroll generation failed");
      setMessage(
        `Payroll generated for ${monthFilter}.`
      );
      fetchPayroll();
    } catch (error) {
      setMessage(error.message || "Unable to generate payroll.");
    }
  };

  useEffect(() => {
    fetchWorkers();
    fetchPayroll();
  }, []);

  useEffect(() => {
    fetchPayroll(1);
  }, [search, statusFilter, monthFilter]);

  return (
    <div className="page">
      <div className="page-heading">
        <h1>Payroll</h1>
        <p>Generate payslips and monitor salary status</p>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="summary-cards">
        <div className="summary-card">
          <span>Generated</span>
          <strong>{payrolls.filter((row) => row.payment_status === "Generated").length}</strong>
        </div>
        <div className="summary-card alt">
          <span>Paid</span>
          <strong>{payrolls.filter((row) => row.payment_status === "Paid").length}</strong>
        </div>
        <div className="summary-card success">
          <span>Total Net Salary</span>
          <strong>₹{formatMoney(payrolls.reduce((sum, row) => sum + Number(row.net_salary || 0), 0))}</strong>
        </div>
      </div>

      <section className="card">
        <div className="list-header">
          <h2>Payroll Controls</h2>
          <div className="list-filters">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search worker" />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All status</option>
              <option value="Draft">Draft</option>
              <option value="Generated">Generated</option>
              <option value="Paid">Paid</option>
            </select>
            <input type="month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} />
            <button type="button" className="primary-btn" onClick={handleGeneratePayroll}>Generate Payroll</button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading payroll...</div>
        ) : payrolls.length === 0 ? (
          <div className="empty-state">No payroll data available.</div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Month</th>
                    <th>Basic</th>
                    <th>O/T</th>
                    <th>Net</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((payroll) => (
                    <tr key={payroll.id}>
                      <td>{payroll.workerName || payroll.worker_id || "-"}</td>
                      <td>{payroll.salary_month}</td>
                      <td>₹{formatMoney(payroll.basic_salary)}</td>
                      <td>₹{formatMoney(payroll.overtime_amount)}</td>
                      <td>₹{formatMoney(payroll.net_salary)}</td>
                      <td><span className={`status ${String(payroll.payment_status || "").toLowerCase().replace(/\s+/g, "-")}`}>{payroll.payment_status}</span></td>
                      <td>
                        <button type="button" className="edit-button" onClick={() => setSelectedSlip(payroll)}>Slip</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button type="button" disabled={pagination.currentPage <= 1} onClick={() => fetchPayroll(pagination.currentPage - 1)}>Previous</button>
              {Array.from({ length: Math.max(1, pagination.totalPages) }, (_, index) => index + 1).map((page) => (
                <button key={page} type="button" className={page === pagination.currentPage ? "active-page" : ""} onClick={() => fetchPayroll(page)}>{page}</button>
              ))}
              <button type="button" disabled={pagination.currentPage >= pagination.totalPages} onClick={() => fetchPayroll(pagination.currentPage + 1)}>Next</button>
            </div>
          </>
        )}
      </section>

      {selectedSlip && (
        <div className="print-slip-wrapper">
          <div className="print-slip">
            <div className="print-header">
              <h3>Salary Slip</h3>
              <button type="button" onClick={() => window.print()}>Print</button>
            </div>
            <div className="slip-grid">
              <div><strong>Worker</strong><span>{selectedSlip.workerName || "-"}</span></div>
              <div><strong>Month</strong><span>{selectedSlip.salary_month}</span></div>
              <div><strong>Basic Salary</strong><span>₹{formatMoney(selectedSlip.basic_salary)}</span></div>
              <div><strong>Overtime</strong><span>₹{formatMoney(selectedSlip.overtime_amount)}</span></div>
              <div><strong>Bonus</strong><span>₹{formatMoney(selectedSlip.bonus)}</span></div>
              <div><strong>Absent Deduction</strong><span>₹{formatMoney(selectedSlip.absent_deduction)}</span></div>
              <div><strong>PF</strong><span>₹{formatMoney(selectedSlip.pf_deduction)}</span></div>
              <div><strong>ESI</strong><span>₹{formatMoney(selectedSlip.esi_deduction)}</span></div>
              <div><strong>Net Salary</strong><span>₹{formatMoney(selectedSlip.net_salary)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payroll;
