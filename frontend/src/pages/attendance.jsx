import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock3,
  UserCheck,
  UserX,
  Timer,
} from "lucide-react";
import "../App.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialForm = {
  workerId: "",
  date: new Date().toISOString().split("T")[0],
  status: "Present",
  overtimeHours: "0",
  shift: "Day",
  remarks: "",
};

const attendanceStatuses = [
  { value: "Present", icon: UserCheck },
  { value: "Absent", icon: UserX },
  { value: "Half Day", icon: Clock3 },
  { value: "Leave", icon: CalendarCheck },
  { value: "Holiday", icon: CalendarCheck },
];

function Attendance() {
  const [records, setRecords] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams();

      if (search) query.append("search", search);
      if (statusFilter) query.append("status", statusFilter);
      if (dateFilter) query.append("date", dateFilter);

      const response = await fetch(
        `${API_URL}/attendance?${query.toString()}`
      );

      const result = await response.json();

      if (result.success) {
        setRecords(result.data || []);
      } else {
        setMessage(result.message);
      }
    } catch {
      setMessage("Attendance API se connection nahi ho pa raha.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await fetch(`${API_URL}/workers`);
      const result = await response.json();

      setWorkers(
        (result.data || []).filter(
          (worker) => worker.status !== "Inactive"
        )
      );
    } catch {
      setMessage("Workers list load nahi ho rahi.");
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttendance();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, statusFilter, dateFilter]);

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

    try {
      const response = await fetch(`${API_URL}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Attendance save nahi hui.");
        return;
      }

      setMessage("Attendance successfully mark ho gayi.");

      setFormData({
        ...initialForm,
        date: formData.date,
      });

      fetchAttendance();
    } catch {
      setMessage("Attendance API se connection nahi ho pa raha.");
    }
  };

  const presentCount = records.filter(
    (record) => record.status === "Present"
  ).length;

  const absentCount = records.filter(
    (record) => record.status === "Absent"
  ).length;

  const leaveCount = records.filter(
    (record) =>
      record.status === "Leave" ||
      record.status === "Half Day"
  ).length;

  const overtimeTotal = records.reduce(
    (total, record) =>
      total + Number(record.overtimeHours || 0),
    0
  );

  return (
    <div className="attendance-page">
      <div className="attendance-heading">
        <div>
          <h1>Attendance Management</h1>
          <p>Track daily attendance, shifts and overtime</p>
        </div>

        <div className="attendance-today">
          <CalendarCheck size={21} />

          <div>
            <span>Today</span>
            <strong>
              {new Intl.DateTimeFormat("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date())}
            </strong>
          </div>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="attendance-summary">
        <div className="attendance-summary-card present-summary">
          <div className="summary-icon">
            <UserCheck size={23} />
          </div>

          <div>
            <span>Present</span>
            <strong>{presentCount}</strong>
          </div>
        </div>

        <div className="attendance-summary-card absent-summary">
          <div className="summary-icon">
            <UserX size={23} />
          </div>

          <div>
            <span>Absent</span>
            <strong>{absentCount}</strong>
          </div>
        </div>

        <div className="attendance-summary-card leave-summary">
          <div className="summary-icon">
            <CalendarCheck size={23} />
          </div>

          <div>
            <span>Leave/Half Day</span>
            <strong>{leaveCount}</strong>
          </div>
        </div>

        <div className="attendance-summary-card overtime-summary">
          <div className="summary-icon">
            <Timer size={23} />
          </div>

          <div>
            <span>Overtime Hours</span>
            <strong>{overtimeTotal}</strong>
          </div>
        </div>
      </div>

      <section className="attendance-form-card">
        <div className="attendance-card-heading">
          <div>
            <h2>Mark Attendance</h2>
            <p>Select a worker and mark the daily attendance</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="attendance-form-grid">
            <div className="attendance-field">
              <label>Worker</label>

              <select
                name="workerId"
                value={formData.workerId}
                onChange={handleChange}
                required
              >
                <option value="">Select worker</option>

                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.workerId} - {worker.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="attendance-field">
              <label>Attendance Date</label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="attendance-field">
              <label>Shift</label>

              <select
                name="shift"
                value={formData.shift}
                onChange={handleChange}
              >
                <option value="Day">Day Shift</option>
                <option value="Night">Night Shift</option>
                <option value="Rotational">
                  Rotational Shift
                </option>
              </select>
            </div>

            <div className="attendance-field">
              <label>Overtime Hours</label>

              <input
                type="number"
                name="overtimeHours"
                value={formData.overtimeHours}
                onChange={handleChange}
                min="0"
                max="24"
              />
            </div>
          </div>

          <div className="attendance-status-section">
            <label>Attendance Status</label>

            <div className="attendance-status-options">
              {attendanceStatuses.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.value}
                    type="button"
                    className={`attendance-status-button ${item.value
                      .toLowerCase()
                      .replaceAll(" ", "-")} ${
                      formData.status === item.value
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setFormData((previous) => ({
                        ...previous,
                        status: item.value,
                      }))
                    }
                  >
                    <Icon size={19} />
                    <span>{item.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="attendance-remarks">
            <label>Remarks</label>

            <textarea
              name="remarks"
              placeholder="Add optional remarks..."
              value={formData.remarks}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <button type="submit" className="mark-attendance-button">
            <CalendarCheck size={19} />
            Mark Attendance
          </button>
        </form>
      </section>

      <section className="attendance-register">
        <div className="attendance-register-header">
          <div>
            <h2>Attendance Register</h2>
            <p>View and filter attendance records</p>
          </div>

          <div className="attendance-filters">
            <input
              type="search"
              placeholder="Search worker..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <input
              type="date"
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(event.target.value)
              }
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="">All statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
              <option value="Leave">Leave</option>
              <option value="Holiday">Holiday</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="attendance-empty">
            Loading attendance...
          </div>
        ) : records.length === 0 ? (
          <div className="attendance-empty">
            <CalendarCheck size={35} />
            <p>No attendance records found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Date</th>
                  <th>Worker</th>
                  <th>Client</th>
                  <th>Shift</th>
                  <th>Status</th>
                  <th>Overtime</th>
                  <th>Remarks</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record, index) => (
                  <tr key={record.id}>
                    <td>{index + 1}</td>
                    <td>
                      {new Date(record.date).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>
                    <td>
                      <div className="attendance-worker">
                        <strong>{record.workerName}</strong>
                        <span>{record.workerCode}</span>
                      </div>
                    </td>
                    <td>{record.clientName}</td>
                    <td>{record.shift}</td>
                    <td>
                      <span
                        className={`attendance-badge ${record.status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td>{record.overtimeHours} hrs</td>
                    <td>{record.remarks || "-"}</td>
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

export default Attendance;