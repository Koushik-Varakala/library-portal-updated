import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const response = await axiosInstance.get(`/book/${id}`);
      setBook(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching book details:", error);
      setLoading(false);
    }
  };

  const handleBorrowClick = () => {
    if (book.availableCopies > 0) {
      navigate(`/borrow/${book._id}`);
    } else {
      navigate(`/waitlist/${book._id}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading book details...</div>;
  }

  if (!book) {
    return <div className="error-message">Book not found</div>;
  }

  return (
    <div className="book-details-page">
      <div className="book-details-container">
        <div className="book-details-header">
          <h1>{book.title}</h1>
          <span
            className={`status-badge ${
              book.availableCopies > 0 ? "available" : "unavailable"
            }`}
          >
            {book.availableCopies > 0 ? "✓ Available" : "✗ Not Available"}
          </span>
        </div>

        <div className="book-details-content">
          <div className="detail-row">
            <strong>Author:</strong>
            <span>{book.author}</span>
          </div>

          <div className="detail-row">
            <strong>Category:</strong>
            <span>{book.category}</span>
          </div>

          <div className="detail-row">
            <strong>Available Copies:</strong>
            <span>
              {book.availableCopies} of {book.totalCopies}
            </span>
          </div>

          <div className="detail-section">
            <strong>Description:</strong>
            <p className="book-description-full">{book.description}</p>
          </div>

          {book.waitlist && book.waitlist.length > 0 && (
            <div className="detail-section">
              <strong>Waitlist:</strong>
              <p>{book.waitlist.length} students waiting</p>
            </div>
          )}
        </div>

        <div className="book-actions">
          <button
            onClick={handleBorrowClick}
            className={`btn-large ${
              book.availableCopies > 0 ? "btn-primary" : "btn-secondary"
            }`}
          >
            {book.availableCopies > 0
              ? "📚 Borrow This Book"
              : "⏳ Join Waitlist"}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn-large btn-outline"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
