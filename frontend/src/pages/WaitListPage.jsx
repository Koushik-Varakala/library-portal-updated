import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const WaitlistPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [waitlist, setWaitlist] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    dept: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [bookRes, waitRes] = await Promise.all([
          axiosInstance.get(`/book/${bookId}`),
          axiosInstance.get(`/waitlist/${bookId}`),
        ]);
        setBook(bookRes.data);
        setWaitlist(waitRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [bookId]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axiosInstance.post(`/waitlist/${bookId}`, formData);
      alert(`${res.data.message}. Your position: ${res.data.position}`);
      navigate(`/book/${bookId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Error joining waitlist");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!book) return <div className="error-message">Book not found</div>;

  return (
    <div className="waitlist-page">
      <div className="form-container">
        <h1>Join Waitlist</h1>

        <div className="book-info-card unavailable">
          <h3>{book.title}</h3>
          <p>by {book.author}</p>
          <p className="unavailable-text">❌ Currently Unavailable</p>
          <p className="waitlist-count">
            {waitlist.length} {waitlist.length === 1 ? "person" : "people"}{" "}
            waiting
          </p>
        </div>

        <div className="waitlist-info">
          <h3>How it works:</h3>
          <ul>
            <li>Fill the form to join the waitlist</li>
            <li>You'll get an email when the book is available</li>
            <li>You’ll have 48 hours to borrow it</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="borrow-form">
          {["name", "studentId", "dept", "email", "phone"].map((field) => (
            <div key={field} className="form-group">
              <label htmlFor={field}>
                {field === "studentId"
                  ? "Roll Number"
                  : field.charAt(0).toUpperCase() + field.slice(1)}{" "}
                *
              </label>
              <input
                type={
                  field === "email"
                    ? "email"
                    : field === "phone"
                    ? "tel"
                    : "text"
                }
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
                placeholder={`Enter your ${
                  field === "studentId" ? "roll number" : field
                }`}
              />
            </div>
          ))}

          <div className="form-actions">
            <button
              type="submit"
              className="btn-large btn-primary"
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Join Waitlist"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-large btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WaitlistPage;
