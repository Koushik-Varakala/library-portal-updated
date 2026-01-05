import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const {
    isStudentAuthenticated,
    isAdminAuthenticated,
    logoutStudent,
    logoutAdmin,
  } = useAuth();

  // Handle logout
  const handleLogout = () => {
    if (isStudentAuthenticated) {
      logoutStudent();
      alert("Student logged out successfully!");
    }
    if (isAdminAuthenticated) {
      logoutAdmin();
      alert("Admin logged out successfully!");
    }
    navigate("/");
  };

  // Corrected states to prevent mixed UI
  const showStudentNav = isStudentAuthenticated && !isAdminAuthenticated;
  const showAdminNav = isAdminAuthenticated && !isStudentAuthenticated;
  const showLoginNav = !isStudentAuthenticated && !isAdminAuthenticated;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          📚 Library Portal
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>

          {/* Student Login */}
          {showLoginNav && (
            <li className="nav-item">
              <Link to="/student/login" className="nav-link">
                🎓 Student Login
              </Link>
            </li>
          )}

          {/* Student Dashboard + Logout */}
          {showStudentNav && (
            <>
              <li className="nav-item">
                <Link to="/student/dashboard" className="nav-link">
                  📘 Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <button className="nav-link btn-logout" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </li>
            </>
          )}

          {/* Admin Dashboard + Logout */}
          {showAdminNav && (
            <>
              <li className="nav-item">
                <Link to="/admin/dashboard" className="nav-link">
                  🛠️ Admin Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <button className="nav-link btn-logout" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
