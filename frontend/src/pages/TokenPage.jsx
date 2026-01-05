import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const TokenPage = () => {
  const { tokenId } = useParams();
  const [borrowData, setBorrowData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTokenInfo();
  }, [tokenId]);

  const fetchTokenInfo = async () => {
    try {
      const response = await axiosInstance.get(`/token/${tokenId}`);
      setBorrowData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching token info:", error);
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <div className="loading">Loading token information...</div>;
  }

  if (!borrowData) {
    return (
      <div className="error-page">
        <h2>Token Not Found</h2>
        <p>The token you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="token-page">
      <div className="token-container">
        <div className="success-icon">✓</div>
        <h1>Book Borrowed Successfully!</h1>
        <p className="success-message">
          Please save this token for your records
        </p>

        <div className="token-display">
          <label>Your Token:</label>
          <div className="token-code">{borrowData.token}</div>
        </div>

        <div className="borrow-details">
          <h2>Borrow Details</h2>

          <div className="detail-item">
            <strong>Book Title:</strong>
            <span>{borrowData.bookId.title}</span>
          </div>

          <div className="detail-item">
            <strong>Author:</strong>
            <span>{borrowData.bookId.author}</span>
          </div>

          <div className="detail-item">
            <strong>Student Name:</strong>
            <span>{borrowData.studentId.name}</span>
          </div>

          <div className="detail-item">
            <strong>Roll Number:</strong>
            <span>{borrowData.studentId.studentId}</span>
          </div>

          <div className="detail-item">
            <strong>Department:</strong>
            <span>{borrowData.studentId.dept}</span>
          </div>

          <div className="detail-item">
            <strong>Issue Date:</strong>
            <span>{formatDate(borrowData.issueDate)}</span>
          </div>

          <div className="detail-item">
            <strong>Return Date:</strong>
            <span className="return-date">
              {formatDate(borrowData.returnDate)}
            </span>
          </div>
        </div>

        <div className="token-actions">
          <button
            onClick={() => window.print()}
            className="btn-large btn-secondary"
          >
            🖨️ Print Token
          </button>
          <Link to="/" className="btn-large btn-primary">
            Back to Home
          </Link>
        </div>

        <div className="important-note">
          <strong>⚠️ Important:</strong> Please return the book by the return
          date to avoid penalties.
        </div>
      </div>
    </div>
  );
};

export default TokenPage;
