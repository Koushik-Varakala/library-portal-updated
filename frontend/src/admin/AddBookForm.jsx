import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const AddBookForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "Mechanical",
    description: "",
    totalCopies: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const categories = [
    {
      value: "Mechanical",
      icon: "⚙️",
      description: "Mechanical Engineering books",
    },
    {
      value: "Electrical",
      icon: "⚡",
      description: "Electrical Engineering books",
    },
    {
      value: "Business",
      icon: "💼",
      description: "Business & Management books",
    },
    { value: "Non-fiction", icon: "📖", description: "Non-fiction literature" },
    { value: "Fiction", icon: "📚", description: "Fiction & novels" },
    { value: "Science", icon: "🔬", description: "Science & Research books" },
    {
      value: "Technology",
      icon: "💻",
      description: "Technology & Computer Science",
    },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.author.trim()) {
      newErrors.author = "Author name is required";
    } else if (formData.author.length < 2) {
      newErrors.author = "Author name must be at least 2 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (formData.totalCopies < 1) {
      newErrors.totalCopies = "At least 1 copy is required";
    } else if (formData.totalCopies > 100) {
      newErrors.totalCopies = "Maximum 100 copies allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "totalCopies" ? parseInt(value) || 0 : value,
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await axiosInstance.post("/admin/book", formData);

      if (response.status === 201) {
        setShowSuccess(true);
      }

      // Reset form
      setFormData({
        title: "",
        author: "",
        category: "Mechanical",
        description: "",
        totalCopies: 1,
      });

      // Hide success message and redirect after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/admin/books");
      }, 2000);
    } catch (error) {
      alert(error.response?.data?.message || "Error adding book");
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      author: "",
      category: "Mechanical",
      description: "",
      totalCopies: 1,
    });
    setErrors({});
  };

  const selectedCategory = categories.find(
    (cat) => cat.value === formData.category
  );

  return (
    <div className="admin-form-page">
      <div className="admin-breadcrumb">
        <Link to="/admin/dashboard">Dashboard</Link>
        <span> / </span>
        <Link to="/admin/books">Books</Link>
        <span> / </span>
        <span>Add New Book</span>
      </div>

      <div className="form-container-large">
        <div className="form-header-enhanced">
          <div className="form-icon">📚</div>
          <h1>Add New Book to Library</h1>
          <p>
            Fill in the details below to add a new book to your library
            collection
          </p>
        </div>

        {showSuccess && (
          <div className="success-banner">
            <div className="success-icon">✓</div>
            <div>
              <strong>Success!</strong> Book added successfully. Redirecting...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form-enhanced">
          {/* Book Title */}
          <div className="form-section">
            <h3 className="section-title">Book Information</h3>

            <div
              className={`form-group-enhanced ${
                errors.title ? "has-error" : ""
              }`}
            >
              <label htmlFor="title">
                Book Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Introduction to Mechanical Engineering"
                className={errors.title ? "error-input" : ""}
              />
              {errors.title && (
                <span className="error-message">{errors.title}</span>
              )}
              <small className="field-hint">
                Enter the complete title of the book
              </small>
            </div>

            <div
              className={`form-group-enhanced ${
                errors.author ? "has-error" : ""
              }`}
            >
              <label htmlFor="author">
                Author Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g., Dr. John Smith"
                className={errors.author ? "error-input" : ""}
              />
              {errors.author && (
                <span className="error-message">{errors.author}</span>
              )}
              <small className="field-hint">Full name of the author</small>
            </div>
          </div>

          {/* Category Selection */}
          <div className="form-section">
            <h3 className="section-title">Category</h3>

            <div className="form-group-enhanced">
              <label htmlFor="category">
                Book Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="select-enhanced"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.value}
                  </option>
                ))}
              </select>
              {selectedCategory && (
                <div className="category-preview">
                  <span className="category-icon">{selectedCategory.icon}</span>
                  <span className="category-desc">
                    {selectedCategory.description}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="form-section">
            <h3 className="section-title">Description</h3>

            <div
              className={`form-group-enhanced ${
                errors.description ? "has-error" : ""
              }`}
            >
              <label htmlFor="description">
                Book Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="Provide a detailed description of the book content, topics covered, target audience, etc."
                className={errors.description ? "error-input" : ""}
              ></textarea>
              {errors.description && (
                <span className="error-message">{errors.description}</span>
              )}
              <div className="character-count">
                {formData.description.length} characters
                {formData.description.length < 20 && (
                  <span className="count-warning"> (minimum 20 required)</span>
                )}
              </div>
            </div>
          </div>

          {/* Copies */}
          <div className="form-section">
            <h3 className="section-title">Availability</h3>

            <div
              className={`form-group-enhanced ${
                errors.totalCopies ? "has-error" : ""
              }`}
            >
              <label htmlFor="totalCopies">
                Number of Copies <span className="required">*</span>
              </label>
              <div className="number-input-wrapper">
                <button
                  type="button"
                  className="number-btn"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      totalCopies: Math.max(1, formData.totalCopies - 1),
                    })
                  }
                >
                  −
                </button>
                <input
                  type="number"
                  id="totalCopies"
                  name="totalCopies"
                  value={formData.totalCopies}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className={`number-input ${
                    errors.totalCopies ? "error-input" : ""
                  }`}
                />
                <button
                  type="button"
                  className="number-btn"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      totalCopies: Math.min(100, formData.totalCopies + 1),
                    })
                  }
                >
                  +
                </button>
              </div>
              {errors.totalCopies && (
                <span className="error-message">{errors.totalCopies}</span>
              )}
              <small className="field-hint">
                Total number of copies available in library (1-100)
              </small>
            </div>
          </div>

          {/* Preview Card */}
          <div className="form-section">
            <h3 className="section-title">Preview</h3>
            <div className="book-preview-card">
              <div className="preview-header">
                <h4>{formData.title || "Book Title"}</h4>
                <span className="preview-category">
                  {selectedCategory?.icon} {formData.category}
                </span>
              </div>
              <p className="preview-author">
                by {formData.author || "Author Name"}
              </p>
              <p className="preview-description">
                {formData.description || "Book description will appear here..."}
              </p>
              <div className="preview-footer">
                <span className="preview-copies">
                  📚 {formData.totalCopies}{" "}
                  {formData.totalCopies === 1 ? "copy" : "copies"} available
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions-enhanced">
            <button
              type="button"
              onClick={handleReset}
              className="btn-large btn-outline"
              disabled={submitting}
            >
              🔄 Reset Form
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="btn-large btn-secondary"
              disabled={submitting}
            >
              ← Cancel
            </button>
            <button
              type="submit"
              className="btn-large btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner"></span> Adding Book...
                </>
              ) : (
                <>✓ Add Book to Library</>
              )}
            </button>
          </div>
        </form>

        <div className="form-footer-note">
          <strong>Note:</strong> All fields marked with{" "}
          <span className="required">*</span> are required. Please ensure all
          information is accurate before submitting.
        </div>
      </div>
    </div>
  );
};

export default AddBookForm;
