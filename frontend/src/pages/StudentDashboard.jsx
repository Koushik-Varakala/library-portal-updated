import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current");
  const [refreshing, setRefreshing] = useState(false);
  const [returningBookId, setReturningBookId] = useState(null);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("studentToken");
  const studentInfo = JSON.parse(localStorage.getItem("studentInfo") || "null");

  useEffect(() => {
    if (!token || !studentInfo) return navigate("/student/login");
    setStudent(studentInfo);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [borrowedRes, historyRes] = await Promise.all([
        axiosInstance.get("/my-borrowed", { headers }),
        axiosInstance.get("/my-history", { headers }),
      ]);

      setBorrowedBooks(borrowedRes.data.data || []);
      setBorrowHistory(historyRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleReturnBook = async (id, title) => {
    if (!window.confirm(`Return "${title}"?`)) return;
    setReturningBookId(id);
    try {
      const res = await axiosInstance.put(
        `/return/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update history immediately
      const returnedBookIndex = borrowHistory.findIndex((b) => b._id === id);
      if (returnedBookIndex !== -1) {
        const updatedBook = {
          ...borrowHistory[returnedBookIndex],
          status: "returned",
          actualReturnDate: new Date().toISOString(),
        };
        const updatedHistory = [...borrowHistory];
        updatedHistory[returnedBookIndex] = updatedBook;
        setBorrowHistory(updatedHistory);
      }

      setMessage(
        res.data.returnedOnTime ? "✅ Returned on time!" : "⚠️ Returned late."
      );

      // Remove from borrowedBooks instantly
      setBorrowedBooks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      setMessage(err.response?.data?.message || "Error returning book");
    } finally {
      setReturningBookId(null);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const daysRemaining = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);
  const statusClass = (d) =>
    d < 0 ? "overdue" : d <= 2 ? "urgent" : d <= 5 ? "warning" : "normal";

  const stats = {
    borrowed: borrowedBooks.length,
    returned: borrowHistory.filter((b) => b.status === "returned").length,
    total: borrowHistory.length,
    overdue: borrowedBooks.filter((b) => daysRemaining(b.returnDate) < 0)
      .length,
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );

  return (
    <div className="student-dashboard">
      {/* Header */}
      <div className="dashboard-header-student">
        <div>
          <h1>Welcome back, {student?.name}! 👋</h1>
          <p>
            Roll: {student?.studentId} | Dept: {student?.dept} | Email:{" "}
            {student?.email}
          </p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => (setRefreshing(true), fetchData())}
            className="btn-secondary"
            disabled={refreshing}
          >
            {refreshing ? "🔄 Refreshing..." : "🔄 Refresh"}
          </button>
          <Link to="/" className="btn-secondary">
            📚 Browse Books
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="student-stats-grid">
        {[
          {
            icon: "📖",
            val: stats.borrowed,
            text: "Currently Borrowed",
            cls: "blue",
          },
          {
            icon: "✅",
            val: stats.returned,
            text: "Books Returned",
            cls: "green",
          },
          {
            icon: "📚",
            val: stats.total,
            text: "Total Borrowed",
            cls: "orange",
          },
          { icon: "⚠️", val: stats.overdue, text: "Overdue Books", cls: "red" },
        ].map(({ icon, val, text, cls }) => (
          <div key={text} className={`student-stat-card ${cls}`}>
            <div className="stat-icon">{icon}</div>
            <div>
              <h3>{val}</h3>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        {["current", "history"].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "current"
              ? `📖 Currently Borrowed (${stats.borrowed})`
              : `📜 Borrow History (${stats.total})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "current" ? (
          borrowedBooks.length ? (
            <div className="borrowed-books-grid">
              {borrowedBooks.map((b) => {
                const days = daysRemaining(b.returnDate);
                const color = statusClass(days);
                return (
                  <div
                    key={b._id}
                    className={`borrowed-book-card ${
                      returningBookId === b._id ? "fading-out" : ""
                    }`}
                  >
                    <div className="book-card-header">
                      <span className={`status-indicator ${color}`}></span>
                      <span className="token-badge">#{b.token}</span>
                    </div>
                    <h3>{b.bookId?.title || "Unknown"}</h3>
                    <p>by {b.bookId?.author || "Unknown Author"}</p>
                    <p>📂 {b.bookId?.category || "Uncategorized"}</p>
                    <div className="borrow-dates">
                      <p>Issued: {formatDate(b.issueDate)}</p>
                      <p>Due: {formatDate(b.returnDate)}</p>
                    </div>
                    <div className={`days-remaining ${color}`}>
                      {days < 0
                        ? `⚠️ Overdue by ${Math.abs(days)} day(s)`
                        : days === 0
                        ? "⏰ Due Today!"
                        : `${days} day(s) remaining`}
                    </div>
                    <button
                      onClick={() => handleReturnBook(b._id, b.bookId?.title)}
                      className="btn-return"
                      disabled={returningBookId === b._id}
                    >
                      {returningBookId === b._id
                        ? "Returning..."
                        : "✓ Return Book"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-books-message">
              <div className="empty-icon">📭</div>
              <h3>No books borrowed currently</h3>
              <p>Browse our collection and borrow your favorite books!</p>
              <Link to="/" className="btn-primary">
                Browse Books
              </Link>
            </div>
          )
        ) : borrowHistory.length ? (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Book</th>
                  <th>Author</th>
                  <th>Issued</th>
                  <th>Due Date</th>
                  <th>Returned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {borrowHistory.map((b) => {
                  const returned = b.status === "returned";
                  const onTime =
                    returned &&
                    new Date(b.actualReturnDate) <= new Date(b.returnDate);
                  return (
                    <tr key={b._id}>
                      <td>#{b.token}</td>
                      <td>
                        <strong>{b.bookId?.title || "Unknown"}</strong>
                      </td>
                      <td>{b.bookId?.author || "Unknown"}</td>
                      <td>{formatDate(b.issueDate)}</td>
                      <td>{formatDate(b.returnDate)}</td>
                      <td>
                        {b.actualReturnDate ? (
                          formatDate(b.actualReturnDate)
                        ) : (
                          <span className="pending-return">Not returned</span>
                        )}
                      </td>
                      <td>
                        {b.status === "returned"
                          ? new Date(b.actualReturnDate) <=
                            new Date(b.returnDate)
                            ? "✓ On Time"
                            : "⚠️ Late"
                          : "📖 Active"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-books-message">
            <div className="empty-icon">📋</div>
            <h3>No borrow history yet</h3>
            <p>Your borrowing history will appear here</p>
          </div>
        )}

        {message && <div className="return-message">{message}</div>}
      </div>
    </div>
  );
};

export default StudentDashboard;
