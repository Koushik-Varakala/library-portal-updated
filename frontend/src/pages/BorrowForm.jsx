import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
const BorrowForm = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [student, setStudent] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    const studentInfo = localStorage.getItem("studentInfo");
    if (token && studentInfo) {
      setIsLoggedIn(true);
      setStudent(JSON.parse(studentInfo));
    }
    fetchBookDetails();
  }, [bookId]);
  const fetchBookDetails = async () => {
    try {
      const response = await axiosInstance.get(`/book/${bookId}`);
      setBook(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching book:", error);
      setLoading(false);
    }
  };
  const handleBorrow = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("studentToken");
      const studentInfo = JSON.parse(localStorage.getItem("studentInfo"));

      const response = await axiosInstance.post(
        `/borrow/${bookId}`,
        {
          name: studentInfo.name,
          studentId: studentInfo.studentId,
          dept: studentInfo.dept,
          email: studentInfo.email,
          phone: studentInfo.phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const borrowToken = response.data.borrow.token;
      alert("Book borrowed successfully!");
      navigate(`/token/${borrowToken}`);
    } catch (error) {
      console.error("Error borrowing:", error);
      alert(error.response?.data?.message || "Error borrowing book");
      setSubmitting(false);
    }
  };
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  if (!book) {
    return <div className="error-message">Book not found</div>;
  }
  if (!isLoggedIn) {
    return (
      <div className="borrow-auth-required">
        <div className="auth-prompt-container">
          <div className="auth-prompt-icon">🔒</div>
          <h2>Authentication Required</h2>
          <p>You need to login to borrow books</p>

          <div className="book-preview-small">
            <h3>{book.title}</h3>
            <p>by {book.author}</p>
          </div>

          <div className="auth-prompt-actions">
            <Link to="/student/login" className="btn-large btn-primary">
              Login to Borrow
            </Link>
            <p className="auth-prompt-note">
              Don't have an account?{" "}
              <Link to="/student/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="borrow-form-page">
      <div className="form-container">
        <h1>Confirm Book Borrowing</h1>

        <div className="book-info-card">
          <h3>{book.title}</h3>
          <p>by {book.author}</p>
          <p className="book-category">Category: {book.category}</p>
          <p className="copies-info">
            Available: {book.availableCopies} of {book.totalCopies}
          </p>
        </div>

        <div className="student-info-card">
          <h3>Borrower Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{student.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Roll Number:</span>
              <span className="info-value">{student.studentId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Department:</span>
              <span className="info-value">{student.dept}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{student.email}</span>
            </div>
          </div>
        </div>

        <div className="borrow-terms">
          <h3>Borrowing Terms</h3>
          <ul>
            <li>📅 Borrowing period: 14 days</li>
            <li>⏰ Please return the book on time to avoid penalties</li>
            <li>💰 Late returns may incur fines</li>
            <li>📱 You can track your borrowed books in your dashboard</li>
          </ul>
        </div>

        <div className="form-actions">
          <button
            onClick={handleBorrow}
            className="btn-large btn-primary"
            disabled={submitting || book.availableCopies === 0}
          >
            {submitting ? "Processing..." : "✓ Confirm Borrowing"}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn-large btn-outline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BorrowForm;
