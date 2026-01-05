const express = require("express");
const router = express.Router();
const {
  adminLogin,
  addBook,
  getAllBooks,
  deleteBook,
  updateBook,
  getDashboardStats,
} = require("../controllers/adminController");

// Admin login
router.post("/login", adminLogin);

// Get dashboard stats
router.get("/stats", getDashboardStats);

// Add book
router.post("/book", addBook);

// Get all books
router.get("/books", getAllBooks);

// Update book
router.put("/book/:id", updateBook);

// Delete book
router.delete("/book/:id", deleteBook);

module.exports = router;
