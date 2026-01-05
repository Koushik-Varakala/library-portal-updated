const Book = require("../models/Book");
const Borrow = require("../models/Borrow");

// Admin login
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      res.json({ message: "Login successful", success: true });
    } else {
      res.status(401).json({ message: "Invalid credentials", success: false });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
};

// Add a new book
exports.addBook = async (req, res) => {
  try {
    const { title, author, category, description, totalCopies } = req.body;

    const book = await Book.create({
      title,
      author,
      category,
      description,
      totalCopies,
      availableCopies: totalCopies,
    });

    res.status(201).json({ message: "Book added successfully", book });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding book", error: error.message });
  }
};

// Get all books (admin view)
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
};

// Delete a book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting book", error: error.message });
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  try {
    const { title, author, category, description, totalCopies } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Calculate the difference in available copies if total copies changed
    const copyDifference = totalCopies - book.totalCopies;

    book.title = title || book.title;
    book.author = author || book.author;
    book.category = category || book.category;
    book.description = description || book.description;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.max(0, book.availableCopies + copyDifference);

    await book.save();

    res.json({ message: "Book updated successfully", book });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating book", error: error.message });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalBorrowed = await Borrow.countDocuments({ status: "active" });
    const totalReturned = await Borrow.countDocuments({ status: "returned" });

    const recentBorrows = await Borrow.find({ status: "active" })
      .populate("bookId")
      .populate("studentId")
      .sort({ issueDate: -1 })
      .limit(5);

    res.json({
      totalBooks,
      totalBorrowed,
      totalReturned,
      recentBorrows,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
};
