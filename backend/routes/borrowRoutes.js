const express = require("express");
const router = express.Router();
const {
  borrowBook,
  getTokenInfo,
  getAllBorrowedBooks,
  joinWaitlist,
  getWaitlist,
  getMyBorrowedBooks,
  getMyHistory,
  returnBook,
} = require("../controllers/borrowController");

const { protect } = require("../middlewares/authMiddleware");
router.post("/borrow/:bookId", borrowBook);

// Get token info
router.get("/token/:tokenId", getTokenInfo);

// Get all borrowed books (admin or general view)
router.get("/borrowed", getAllBorrowedBooks);

// ✅ Student-only routes
router.get("/my-borrowed", protect, getMyBorrowedBooks);
router.get("/my-history", protect, getMyHistory);

// Join waitlist
router.post("/waitlist/:bookId", joinWaitlist);

// Get waitlist for a book
router.get("/waitlist/:bookId", getWaitlist);

router.put("/return/:borrowId", protect, returnBook);
module.exports = router;
