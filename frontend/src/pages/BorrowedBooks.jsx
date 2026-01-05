import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const BorrowedBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    try {
      const response = await axiosInstance.get("/borrowed");
      setBorrowedBooks(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching borrowed books:", error);
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (returnDate) => {
    const today = new Date();
    const returnDay = new Date(returnDate);
    const diffTime = returnDay - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <div className="loading">Loading borrowed books...</div>;
  }

  return (
    <div className="borrowed-books-page">
      <div className="page-header">
        <h1>Currently Borrowed Books</h1>
        <p>Total: {borrowedBooks.length} books</p>
      </div>

      {borrowedBooks.length === 0 ? (
        <div className="no-data">
          <p>No books are currently borrowed</p>
        </div>
      ) : (
        <div className="borrowed-table-container">
          <table className="borrowed-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Book Title</th>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Issue Date</th>
                <th>Return Date</th>
                <th>Days Remaining</th>
              </tr>
            </thead>
            <tbody>
              {borrowedBooks.map((borrow) => {
                const daysRemaining = getDaysRemaining(borrow.returnDate);
                return (
                  <tr key={borrow._id}>
                    <td className="token-cell">{borrow.token}</td>
                    <td>
                      <strong>{borrow.bookId?.title || "Unknown Title"}</strong>
                      <br />
                      <small>
                        by {borrow.bookId?.author || "Unknown Author"}
                      </small>
                    </td>
                    <td>{borrow.studentId?.name || "Unknown Student"}</td>
                    <td>{borrow.studentId?.studentId || "N/A"}</td>
                    <td>{formatDate(borrow.issueDate)}</td>
                    <td>{formatDate(borrow.returnDate)}</td>
                    <td>
                      <span
                        className={`days-badge ${
                          daysRemaining < 3
                            ? "urgent"
                            : daysRemaining < 7
                            ? "warning"
                            : "normal"
                        }`}
                      >
                        {daysRemaining > 0
                          ? `${daysRemaining} days`
                          : "Overdue"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BorrowedBooks;
