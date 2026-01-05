import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const BooksList = () => {
  const { category } = useParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, [category]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/books/${category}`);
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Optional: call this after borrowing a book
  const handleBorrowed = () => {
    setRefreshing(true);
    fetchBooks(); // re-fetch latest counts
  };

  if (loading) {
    return <div className="loading">Loading books...</div>;
  }

  return (
    <div className="books-list-page">
      <div className="page-header">
        <h1>{category} Books</h1>
        <p>Found {books.length} books in this category</p>
      </div>

      {books.length === 0 ? (
        <div className="no-books">
          <p>No books found in this category.</p>
          <Link to="/" className="btn-primary">
            Back to Categories
          </Link>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <div key={book._id} className="book-card">
              <div className="book-card-header">
                <h3>{book.title}</h3>
                <span
                  className={`availability-badge ${
                    book.availableCopies > 0 ? "available" : "unavailable"
                  }`}
                >
                  {book.availableCopies > 0 ? "Available" : "Not Available"}
                </span>
              </div>
              <p className="book-author">by {book.author}</p>
              <p className="book-description">
                {book.description.substring(0, 100)}...
              </p>
              <div className="book-card-footer">
                <span className="book-copies">
                  {book.availableCopies} of {book.totalCopies} available
                </span>
                <Link
                  to={`/book/${book._id}`}
                  className="btn-view"
                  onClick={handleBorrowed} // optional trigger after borrow
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BooksList;
