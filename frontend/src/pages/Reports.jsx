import { useEffect, useState } from "react";
import "../App.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function Reports() {
  const [summary, setSummary] = useState({
    totals: {
      clients: 0,
      workers: 0,
      deployedWorkers: 0,
      openJobs: 0,
      monthlyPayroll: 0,
      pendingInvoices: 0,
      monthlySales: 0,
      monthlyPurchases: 0,
      totalAssets: 0,
    },
    recentDeployments: [],
    recentAttendance: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/reports/summary`);
      const result = await response.json();
      if (response.ok && result.success) setSummary(result.data || summary);
    } catch {
      // Intentionally silent for report summary fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const cards = [
    { label: "Clients", value: summary.totals.clients || 0 },
    { label: "Workers", value: summary.totals.workers || 0 },
    { label: "Deployed", value: summary.totals.deployedWorkers || 0 },
    { label: "Open Jobs", value: summary.totals.openJobs || 0 },
    { label: "Payroll", value: `₹${formatMoney(summary.totals.monthlyPayroll)}` },
    { label: "Pending Invoices", value: summary.totals.pendingInvoices || 0 },
    { label: "Sales", value: `₹${formatMoney(summary.totals.monthlySales)}` },
    { label: "Expenses", value: `₹${formatMoney(summary.totals.monthlyPurchases)}` },
  ];

  return (
    <div className="page">
      <div className="page-heading">
        <h1>Reports</h1>
        <p>Operational overview and performance metrics</p>
      </div>

      <section className="card">
        <h2>Executive Summary</h2>
        {loading ? <div className="empty-state">Loading reports...</div> : (
          <div className="dashboard-cards">
            {cards.map((card) => (
              <div key={card.label} className="dashboard-card blue-card">
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Reports;
