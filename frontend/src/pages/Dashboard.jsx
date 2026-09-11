import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  UserCheck,
  BriefcaseBusiness,
  UserPlus,
  Building,
  ClipboardPlus,
  ArrowRight,
  IndianRupee,
  ReceiptText,
  TrendingUp,
  Package,
} from "lucide-react";
import "../App.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Dashboard() {
  const [summary, setSummary] = useState({
    totals: {
      clients: 0,
      workers: 0,
      availableWorkers: 0,
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
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("workforce_token");
      const response = await fetch(`${API_URL}/reports/summary`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Summary fetch failed");
      }

      setSummary(result.data || { totals: {}, recentDeployments: [], recentAttendance: [] });
    } catch (err) {
      setError(err.message || "Dashboard data could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalWorkers = summary.totals.workers || 0;
  const availableWorkers = summary.totals.availableWorkers || 0;
  const deployedWorkers = summary.totals.deployedWorkers || 0;
  const openJobs = summary.totals.openJobs || 0;
  const activeClients = summary.totals.clients || 0;

  const availablePercentage = totalWorkers
    ? Math.round((availableWorkers / totalWorkers) * 100)
    : 0;

  const deployedPercentage = totalWorkers
    ? Math.round((deployedWorkers / totalWorkers) * 100)
    : 0;

  const currentDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const statCards = [
    {
      title: "Total Clients",
      value: summary.totals.clients || 0,
      description: `${activeClients} active clients`,
      icon: Building2,
      color: "blue",
    },
    {
      title: "Total Workers",
      value: totalWorkers,
      description: `${availableWorkers} available`,
      icon: Users,
      color: "green",
    },
    {
      title: "Deployed Workers",
      value: deployedWorkers,
      description: "Working with clients",
      icon: UserCheck,
      color: "purple",
    },
    {
      title: "Open Jobs",
      value: openJobs,
      description: "Current requirements",
      icon: BriefcaseBusiness,
      color: "orange",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div>
          <h1>Welcome back, Admin!</h1>
          <p>Here is today’s manpower business overview.</p>
        </div>
        <div className="current-date">{currentDate}</div>
      </div>

      {error && (
        <div className="dashboard-error">
          <span>{error}</span>
          <button type="button" onClick={fetchDashboardData}>Try Again</button>
        </div>
      )}

      <div className="stats-grid">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.title} className={`stat-card stat-${card.color}`}>
              <div className="stat-card-content">
                <span className="stat-title">{card.title}</span>
                <strong>{card.value}</strong>
                <p>{card.description}</p>
              </div>

              <div className="stat-icon">
                <Icon size={25} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-content-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Worker Status Overview</h2>
              <p>Current workforce availability</p>
            </div>
          </div>

          <div className="worker-overview">
            <div className="overview-total">
              <strong>{totalWorkers}</strong>
              <span>Total Workers</span>
            </div>

            <div className="progress-section">
              <div className="progress-item">
                <div className="progress-label">
                  <span>Available</span>
                  <strong>{availableWorkers} ({availablePercentage}%)</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill available-progress" style={{ width: `${availablePercentage}%` }}></div>
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-label">
                  <span>Deployed</span>
                  <strong>{deployedWorkers} ({deployedPercentage}%)</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill deployed-progress" style={{ width: `${deployedPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Frequently used operations</p>
            </div>
          </div>

          <div className="quick-actions">
            <Link to="/clients" className="quick-action">
              <Building size={21} />
              <span>Add Client</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/workers" className="quick-action">
              <UserPlus size={21} />
              <span>Add Worker</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/jobs" className="quick-action">
              <ClipboardPlus size={21} />
              <span>Create Requirement</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </div>

      <div className="dashboard-table-grid">
        <section className="dashboard-panel">
          <div className="panel-heading heading-with-link">
            <div>
              <h2>Finance Snapshot</h2>
              <p>Monthly business activity</p>
            </div>
          </div>

          <div className="dashboard-mini-grid">
            <div className="mini-stat"><IndianRupee size={16} /><div><span>Payroll</span><strong>₹{Number(summary.totals.monthlyPayroll || 0).toLocaleString('en-IN')}</strong></div></div>
            <div className="mini-stat"><ReceiptText size={16} /><div><span>Invoices</span><strong>{summary.totals.pendingInvoices || 0} pending</strong></div></div>
            <div className="mini-stat"><TrendingUp size={16} /><div><span>Sales</span><strong>₹{Number(summary.totals.monthlySales || 0).toLocaleString('en-IN')}</strong></div></div>
            <div className="mini-stat"><Package size={16} /><div><span>Assets</span><strong>{summary.totals.totalAssets || 0}</strong></div></div>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading heading-with-link">
            <div>
              <h2>Recent Deployments</h2>
              <p>Latest active assignments</p>
            </div>
            <Link to="/deployments">View all</Link>
          </div>

          {summary.recentDeployments.length === 0 ? (
            <div className="dashboard-empty">No recent deployments.</div>
          ) : (
            <div className="dashboard-table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Client</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentDeployments.map((item) => (
                    <tr key={item.deploymentId || item.id}>
                      <td>{item.workerName || "-"}</td>
                      <td>{item.clientName || "-"}</td>
                      <td><span className={`status ${String(item.status || "").toLowerCase().replace(/\s+/g, "-")}`}>{item.status || "-"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="dashboard-panel">
        <div className="panel-heading heading-with-link">
          <div>
            <h2>Recent Attendance</h2>
            <p>Last checked-in workers</p>
          </div>
          <Link to="/attendance">View all</Link>
        </div>

        {summary.recentAttendance.length === 0 ? (
          <div className="dashboard-empty">No recent attendance.</div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentAttendance.map((item) => (
                  <tr key={item.attendanceId || item.id}>
                    <td>{item.workerName || "-"}</td>
                    <td>{item.attendanceDate ? new Date(item.attendanceDate).toLocaleDateString("en-CA") : "-"}</td>
                    <td><span className={`status ${String(item.attendanceStatus || "").toLowerCase().replace(/\s+/g, "-")}`}>{item.attendanceStatus || "-"}</span></td>
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

export default Dashboard;