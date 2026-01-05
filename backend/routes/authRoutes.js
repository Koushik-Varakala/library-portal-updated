const express = require("express");
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  getStudentProfile,
  updateStudentProfile,
  logoutStudent,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

// Public routes
router.post("/register", registerStudent);
router.post("/login", loginStudent);

// Protected routes (require JWT token)
router.get("/profile", protect, getStudentProfile);
router.put("/profile", protect, updateStudentProfile);
router.post("/logout", protect, logoutStudent);

module.exports = router;
