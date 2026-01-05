import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const BookListAdmin = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
      return;
    }
    fetchBooks();
  }, [navigate]);

  useEffect(() => {
    filterAndSortBooks();
  }, [books, filter, searchTerm, sortBy]);

  const fetchBooks = async () => {
    try {
      const response = await axiosInstance.get("/admin/books");
      setBooks(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching books:", error);
      setLoading(false);
    }
  };

  const filterAndSortBooks = () => {
    let result = [...books];

    // Filter by category
    if (filter !== "all") {
      result = result.filter((book) => book.category === filter);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(search) ||
          book.author.toLowerCase().includes(search) ||
          book.category.toLowerCase().includes(search)
      );
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "author-asc":
        result.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case "available":
        result.sort((a, b) => b.availableCopies - a.availableCopies);
        break;
      default:
        break;
    }

    setFilteredBooks(result);
  };

  const handleDelete = (book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;

    try {
      await axiosInstance.delete(`/admin/book/${bookToDelete._id}`);
      setBooks(books.filter((b) => b._id !== bookToDelete._id));
      setShowDeleteModal(false);
      setBookToDelete(null);
      alert("Book deleted successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting book");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBooks.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedBooks.length} selected books?`
      )
    ) {
      try {
        await Promise.all(
          selectedBooks.map((id) => axiosInstance.delete(`/admin/book/${id}`))
        );
        setBooks(books.filter((b) => !selectedBooks.includes(b._id)));
        setSelectedBooks([]);
        alert(`${selectedBooks.length} books deleted successfully!`);
      } catch (error) {
        console.log(error);
        alert("Error deleting some books");
      }
    }
  };

  const toggleSelectBook = (bookId) => {
    setSelectedBooks((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBooks.length === filteredBooks.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(filteredBooks.map((book) => book._id));
    }
  };
  const categoryCounts = books.reduce(
    (acc, book) => {
      acc[book.category] = (acc[book.category] || 0) + 1;
      return acc;
    },
    { all: books.length }
  );
  const categories = [
    { value: "all", label: "All Categories", icon: "📚", count: books.length },
    {
      value: "Mechanical",
      label: "Mechanical",
      icon: "⚙️",
      count: categoryCounts["Mechanical"] || 0,
    },
    {
      value: "Electrical",
      label: "Electrical",
      icon: "⚡",
      count: categoryCounts["Electrical"] || 0,
    },
    {
      value: "Business",
      label: "Business",
      icon: "💼",
      count: categoryCounts["Business"] || 0,
    },
    {
      value: "Non-fiction",
      label: "Non-fiction",
      icon: "📖",
      count: categoryCounts["Non-fiction"] || 0,
    },
    {
      value: "Fiction",
      label: "Fiction",
      icon: "📚",
      count: categoryCounts["Fiction"] || 0,
    },
    {
      value: "Science",
      label: "Science",
      icon: "🔬",
      count: categoryCounts["Science"] || 0,
    },
    {
      value: "Technology",
      label: "Technology",
      icon: "💻",
      count: categoryCounts["Technology"] || 0,
    },
  ];

  const stats = {
    total: books.length,
    available: books.filter((b) => b.availableCopies > 0).length,
    borrowed: books.filter((b) => b.availableCopies === 0).length,
    waitlist: books.reduce((acc, b) => acc + (b.waitlist?.length || 0), 0),
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading books...</p>
      </div>
    );
  }

  return (
    <div className="admin-books-page-enhanced">
      {/* Breadcrumb */}
      <div className="admin-breadcrumb">
        <Link to="/admin/dashboard">Dashboard</Link>
        <span> / </span>
        <span>Manage Books</span>
      </div>

      {/* Header with Stats */}
      <div className="page-header-enhanced">
        <div className="header-left">
          <h1>📚 Library Books Management</h1>
          <p>Manage and organize your entire book collection</p>
        </div>
        <button
          onClick={() => navigate("/admin/add-book")}
          className="btn-primary btn-large"
        >
          ➕ Add New Book
        </button>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats-grid">
        <div className="stat-box">
          <div className="stat-icon blue">📚</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Books</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon green">✅</div>
          <div className="stat-content">
            <h3>{stats.available}</h3>
            <p>Available</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon orange">📖</div>
          <div className="stat-content">
            <h3>{stats.borrowed}</h3>
            <p>Fully Borrowed</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon purple">⏳</div>
          <div className="stat-content">
            <h3>{stats.waitlist}</h3>
            <p>In Waitlist</p>
          </div>
        </div>
      </div>

      {/* Filter Categories */}
      <div className="category-filter-tabs">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`category-tab ${filter === cat.value ? "active" : ""}`}
          >
            <span className="tab-icon">{cat.icon}</span>
            <span className="tab-label">{cat.label}</span>
            <span className="tab-count">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Search, Sort, and View Controls */}
      <div className="controls-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title, author, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="clear-search">
              ✕
            </button>
          )}
        </div>

        <div className="controls-right">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="author-asc">Author (A-Z)</option>
            <option value="available">Most Available</option>
          </select>

          <div className="view-toggle">
            <button
              onClick={() => setViewMode("table")}
              className={`view-btn ${viewMode === "table" ? "active" : ""}`}
              title="Table View"
            >
              ☰
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              title="Grid View"
            >
              ⊞
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedBooks.length > 0 && (
        <div className="bulk-actions-bar">
          <span className="selected-count">
            {selectedBooks.length} book{selectedBooks.length > 1 ? "s" : ""}{" "}
            selected
          </span>
          <button onClick={handleBulkDelete} className="btn-danger">
            🗑️ Delete Selected
          </button>
          <button onClick={() => setSelectedBooks([])} className="btn-outline">
            Clear Selection
          </button>
        </div>
      )}

      {/* Results Count */}
      <div className="results-info">
        Showing <strong>{filteredBooks.length}</strong> of{" "}
        <strong>{books.length}</strong> books
        {searchTerm && ` for "${searchTerm}"`}
      </div>

      {/* Books Display */}
      {filteredBooks.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">📭</div>
          <h3>No books found</h3>
          <p>Try adjusting your filters or search terms</p>
          <button
            onClick={() => {
              setFilter("all");
              setSearchTerm("");
            }}
            className="btn-primary"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        <div className="table-container-enhanced">
          <table className="books-table-enhanced">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedBooks.length === filteredBooks.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Book Details</th>
                <th>Category</th>
                <th className="center">Copies</th>
                <th className="center">Available</th>
                <th className="center">Waitlist</th>
                <th className="center">Status</th>
                <th className="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr
                  key={book._id}
                  className={
                    selectedBooks.includes(book._id) ? "selected-row" : ""
                  }
                >
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedBooks.includes(book._id)}
                      onChange={() => toggleSelectBook(book._id)}
                    />
                  </td>
                  <td className="book-details-cell">
                    <div className="book-title-admin">{book.title}</div>
                    <div className="book-author-admin">by {book.author}</div>
                  </td>
                  <td>
                    <span className="category-badge-enhanced">
                      {book.category}
                    </span>
                  </td>
                  <td className="center">
                    <span className="copies-badge">{book.totalCopies}</span>
                  </td>
                  <td className="center">
                    <span
                      className={`available-badge ${
                        book.availableCopies > 0 ? "has-copies" : "no-copies"
                      }`}
                    >
                      {book.availableCopies}
                    </span>
                  </td>
                  <td className="center">
                    <span className="waitlist-badge">
                      {book.waitlist?.length || 0}
                    </span>
                  </td>
                  <td className="center">
                    {book.availableCopies > 0 ? (
                      <span className="status-badge available">Available</span>
                    ) : (
                      <span className="status-badge unavailable">Borrowed</span>
                    )}
                  </td>
                  <td className="center">
                    <div className="action-buttons-group">
                      <button
                        onClick={() => navigate(`/book/${book._id}`)}
                        className="btn-icon btn-view-icon"
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleDelete(book)}
                        className="btn-icon btn-delete-icon"
                        title="Delete Book"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="books-grid-view">
          {filteredBooks.map((book) => (
            <div
              key={book._id}
              className={`book-card-admin ${
                selectedBooks.includes(book._id) ? "selected-card" : ""
              }`}
            >
              <div className="card-checkbox">
                <input
                  type="checkbox"
                  checked={selectedBooks.includes(book._id)}
                  onChange={() => toggleSelectBook(book._id)}
                />
              </div>
              <div className="card-category-badge">{book.category}</div>
              <h3 className="card-title">{book.title}</h3>
              <p className="card-author">by {book.author}</p>
              <p className="card-description">
                {book.description.substring(0, 100)}...
              </p>
              <div className="card-stats">
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{book.totalCopies}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Available:</span>
                  <span
                    className={`stat-value ${
                      book.availableCopies > 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {book.availableCopies}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Waitlist:</span>
                  <span className="stat-value">
                    {book.waitlist?.length || 0}
                  </span>
                </div>
              </div>
              <div className="card-actions">
                <button
                  onClick={() => navigate(`/book/${book._id}`)}
                  className="btn-card btn-view"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDelete(book)}
                  className="btn-card btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Confirm Deletion</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this book?</p>
              <div className="book-to-delete">
                <strong>{bookToDelete?.title}</strong>
                <p>by {bookToDelete?.author}</p>
              </div>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-large btn-outline"
              >
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn-large btn-danger">
                Yes, Delete Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookListAdmin;
