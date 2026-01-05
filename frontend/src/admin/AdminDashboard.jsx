import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalBorrowed: 0,
    totalReturned: 0,
    recentBorrows: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
      return;
    }
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/admin/stats");
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin/login");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>📊 Admin Dashboard</h1>
          <p>Welcome back! Manage your library efficiently</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">
          🚪 Logout
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats.totalBooks}</h3>
            <p>Total Books</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <h3>{stats.totalBorrowed}</h3>
            <p>Currently Borrowed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.totalReturned}</h3>
            <p>Total Returned</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>
              {stats.totalBorrowed > 0
                ? Math.round(
                    (stats.totalReturned /
                      (stats.totalBorrowed + stats.totalReturned)) *
                      100
                  )
                : 0}
              %
            </h3>
            <p>Return Rate</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>⚡ Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/admin/add-book" className="action-card">
            <div className="action-icon">➕</div>
            <h3>Add New Book</h3>
            <p>Add books to the library collection</p>
          </Link>

          <Link to="/admin/books" className="action-card">
            <div className="action-icon">📋</div>
            <h3>Manage Books</h3>
            <p>View, edit, and delete books</p>
          </Link>

          <Link to="/borrowed" className="action-card">
            <div className="action-icon">📊</div>
            <h3>Borrowed Books</h3>
            <p>View all borrowing records</p>
          </Link>

          <Link to="/" className="action-card">
            <div className="action-icon">🏠</div>
            <h3>Public Portal</h3>
            <p>View the student portal</p>
          </Link>
        </div>
      </div>

      {stats.recentBorrows && stats.recentBorrows.length > 0 && (
        <div className="recent-activity">
          <h2>📅 Recent Borrowings</h2>
          <table className="activity-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Book Title</th>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Issue Date</th>
                <th>Return Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBorrows.map((borrow) => (
                <tr key={borrow._id}>
                  <td className="token-cell">{borrow.token}</td>
                  <td>
                    <strong>
                      {borrow.bookId ? borrow.bookId.title : "Unknown Book"}
                    </strong>
                    <br />
                    <small style={{ color: "#64748b" }}>
                      {borrow.bookId
                        ? `by ${borrow.bookId.author}`
                        : "No author"}
                    </small>
                  </td>
                  <td>
                    {borrow.studentId
                      ? borrow.studentId.name
                      : "Unknown Student"}
                  </td>
                  <td>
                    {borrow.studentId ? borrow.studentId.studentId : "N/A"}
                  </td>
                  <td>{formatDate(borrow.issueDate)}</td>
                  <td>{formatDate(borrow.returnDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="admin-info-section">
        <div className="info-card">
          <h3>💡 Tips for Managing the Library</h3>
          <ul>
            <li>
              Regularly check for overdue books in the Borrowed Books section
            </li>
            <li>Update book quantities when new copies arrive</li>
            <li>Monitor waitlists to ensure popular books are well-stocked</li>
            <li>Review borrowing patterns to understand student preferences</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
