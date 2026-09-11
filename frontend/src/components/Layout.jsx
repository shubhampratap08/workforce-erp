import { Bell, Menu, Search } from "lucide-react";
import Sidebar from "./sidebar.jsx";
import "./Layout.css";

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <header className="top-navbar">
          <div className="navbar-left">
            <button type="button" className="mobile-menu-button">
              <Menu size={22} />
            </button>

            <div className="navbar-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search anything..."
              />
            </div>
          </div>

          <div className="navbar-right">
            <button type="button" className="notification-button">
              <Bell size={21} />
              <span className="notification-dot"></span>
            </button>

            <div className="user-profile">
              <div className="user-avatar">AS</div>

              <div className="user-details">
                <strong>Admin User</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

export default Layout;