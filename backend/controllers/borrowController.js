const Borrow = require("../models/Borrow");
const Book = require("../models/Book");
const Student = require("../models/Student");
const crypto = require("crypto");

exports.borrowBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { name, studentId, dept, email, phone } = req.body;

    console.log("Incoming borrow request:", {
      bookId,
      name,
      studentId,
      dept,
      email,
      phone,
    });

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.availableCopies <= 0) {
      return res
        .status(400)
        .json({ message: "Book not available. Join waitlist." });
    }

    let student = await Student.findOne({ studentId });
    if (!student) {
      student = await Student.create({ name, studentId, dept, email, phone });
    }

    const token = crypto.randomBytes(8).toString("hex").toUpperCase();

    const borrow = await Borrow.create({
      bookId,
      studentId: student._id,
      token,
    });

    book.availableCopies -= 1;
    await book.save();

    const populatedBorrow = await Borrow.findById(borrow._id)
      .populate("bookId")
      .populate("studentId");

    res.status(201).json({
      message: "Book borrowed successfully",
      borrow: populatedBorrow,
    });
  } catch (error) {
    console.error("❌ Error borrowing book:", error); // ADD THIS LINE
    res.status(500).json({
      message: "Error borrowing book",
      error: error.message,
    });
  }
};
exports.getTokenInfo = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const borrow = await Borrow.findOne({ token: tokenId })
      .populate("bookId")
      .populate("studentId");

    if (!borrow) {
      return res.status(404).json({ message: "Token not found" });
    }

    res.json(borrow);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching token info", error: error.message });
  }
};

exports.getAllBorrowedBooks = async (req, res) => {
  try {
    const borrows = await Borrow.find({ status: "active" })
      .populate("bookId")
      .populate("studentId")
      .sort({ issueDate: -1 });

    res.json(borrows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching borrowed books", error: error.message });
  }
};

exports.joinWaitlist = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { name, studentId, dept, email, phone } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    let student = await Student.findOne({ studentId });
    if (!student) {
      student = await Student.create({ name, studentId, dept, email, phone });
    }

    const alreadyInWaitlist = book.waitlist.some(
      (item) => item.studentId.toString() === student._id.toString()
    );

    if (alreadyInWaitlist) {
      return res.status(400).json({ message: "Already in waitlist" });
    }

    book.waitlist.push({ studentId: student._id });
    await book.save();

    res.json({
      message: "Added to waitlist successfully",
      position: book.waitlist.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error joining waitlist", error: error.message });
  }
};

exports.getWaitlist = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId).populate("waitlist.studentId");

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book.waitlist);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching waitlist", error: error.message });
  }
};
// ✅ Get logged-in student's active borrowed books
exports.getMyBorrowedBooks = async (req, res) => {
  try {
    const studentId = req.student._id; // ✅ use req.student
    const borrows = await Borrow.find({
      studentId,
      status: "active",
    })
      .populate("bookId")
      .sort({ issueDate: -1 });

    res.json({
      success: true,
      count: borrows.length,
      data: borrows,
    });
  } catch (error) {
    console.error("Error fetching borrowed books:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching borrowed books",
    });
  }
};

// ✅ Get logged-in student's borrow history (all)
exports.getMyHistory = async (req, res) => {
  try {
    const studentId = req.student._id;

    const history = await Borrow.find({ studentId })
      .populate("bookId")
      .populate("studentId")
      .sort({ issueDate: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching history",
      error: error.message,
    });
  }
};
exports.returnBook = async (req, res) => {
  try {
    const { borrowId } = req.params;

    const borrow = await Borrow.findById(borrowId).populate("bookId");
    if (!borrow) {
      return res.status(404).json({ message: "Borrow record not found" });
    }

    if (borrow.status === "returned") {
      return res.status(400).json({ message: "Book already returned" });
    }

    borrow.status = "returned";
    borrow.actualReturnDate = new Date();
    await borrow.save();

    // Increment availableCopies
    const book = borrow.bookId;
    book.availableCopies += 1;
    await book.save();

    const returnedOnTime = borrow.actualReturnDate <= borrow.returnDate;

    res.json({
      message: "Book returned successfully",
      returnedOnTime,
      borrow,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error returning book", error: error.message });
  }
};
