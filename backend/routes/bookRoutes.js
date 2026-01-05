const express = require("express");
const router = express.Router();
const {
  getBooksByCategory,
  getBookById,
  getAllCategories,
} = require("../controllers/bookController");

router.get("/categories", getAllCategories);

router.get("/books/:category", getBooksByCategory);

router.get("/book/:id", getBookById);

module.exports = router;
