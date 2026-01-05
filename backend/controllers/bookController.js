const Book = require("../models/Book");

exports.getBooksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const books = await Book.find({ category });
    res.json(books);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "waitlist.studentId"
    );
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(book);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching book", error: error.message });
  }
};
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Book.distinct("category");
    res.json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};
