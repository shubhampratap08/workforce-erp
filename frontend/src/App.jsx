import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Workers from "./pages/Workers";
import JobRequirements from "./pages/JobRequirements";
import Deployments from "./pages/deployments";

import Attendance from "./pages/attendance"; 
import Payroll from "./pages/Payroll";
import Invoices from "./pages/Invoices";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import Assets from "./pages/Assets";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import "./App.css";

function ProtectedRoute() {
  const token = localStorage.getItem("workforce_token");

  return token ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/login" replace />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/workers" element={<Workers />} />
        <Route path="/jobs" element={<JobRequirements />} />
        <Route path="/deployments" element={<Deployments />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;