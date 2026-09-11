import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  BriefcaseBusiness,
  UserCheck,
  CalendarCheck,
  WalletCards,
  ReceiptText,
  TrendingUp,
  ShoppingCart,
  Package,
  FileBarChart,
  LogOut,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Clients", icon: Building2, path: "/clients" },
  { name: "Workers", icon: Users, path: "/workers" },
  { name: "Job Requirements", icon: BriefcaseBusiness, path: "/jobs" },
  { name: "Deployments", icon: UserCheck, path: "/deployments" },
  { name: "Attendance", icon: CalendarCheck, path: "/attendance" },
  { name: "Payroll", icon: WalletCards, path: "/payroll" },
  { name: "Invoices", icon: ReceiptText, path: "/invoices" },
  { name: "Sales", icon: TrendingUp, path: "/sales" },
  { name: "Purchases", icon: ShoppingCart, path: "/purchases" },
  { name: "Assets", icon: Package, path: "/assets" },
  { name: "Reports", icon: FileBarChart, path: "/reports" },
];

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("workforce_token");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">W</div>

        <div>
          <h2>WorkForce ERP</h2>
          <p>Manpower Management</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `menu-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <button type="button" className="logout-button" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;