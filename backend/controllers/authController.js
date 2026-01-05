const Student = require("../models/Student");
const jwt = require("jsonwebtoken");

// Helper function to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register new student
// @route   POST /api/auth/register
// @access  Public
exports.registerStudent = async (req, res) => {
  try {
    const { name, studentId, email, password, dept, phone } = req.body;

    // Validation
    if (!name || !studentId || !email || !password || !dept || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if password meets minimum length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if student already exists
    const studentExists = await Student.findOne({
      $or: [{ email }, { studentId }],
    });

    if (studentExists) {
      if (studentExists.email === email) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }
      if (studentExists.studentId === studentId) {
        return res.status(400).json({
          success: false,
          message: "Student ID already registered",
        });
      }
    }

    // Create student (password will be hashed automatically by pre-save hook)
    const student = await Student.create({
      name,
      studentId,
      email,
      password,
      dept,
      phone,
    });

    if (student) {
      // Generate token
      const token = generateToken(student._id);

      res.status(201).json({
        success: true,
        message: "Registration successful",
        student: {
          _id: student._id,
          name: student.name,
          studentId: student.studentId,
          email: student.email,
          dept: student.dept,
          phone: student.phone,
          isActive: student.isActive,
          createdAt: student.createdAt,
        },
        token,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid student data",
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// @desc    Login student
// @route   POST /api/auth/login
// @access  Public
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check for student (include password field)
    const student = await Student.findOne({ email }).select("+password");

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is active
    if (!student.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact admin.",
      });
    }

    // Check if password matches
    const isMatch = await student.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(student._id);

    res.json({
      success: true,
      message: "Login successful",
      student: {
        _id: student._id,
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        dept: student.dept,
        phone: student.phone,
        isActive: student.isActive,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// @desc    Get student profile
// @route   GET /api/auth/profile
// @access  Private
exports.getStudentProfile = async (req, res) => {
  try {
    // req.student is set by protect middleware
    const student = await Student.findById(req.student._id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      student: {
        _id: student._id,
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        dept: student.dept,
        phone: student.phone,
        isActive: student.isActive,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// @desc    Update student profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id).select("+password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Update fields
    student.name = req.body.name || student.name;
    student.dept = req.body.dept || student.dept;
    student.phone = req.body.phone || student.phone;

    // Update password if provided
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      student.password = req.body.password; // Will be hashed by pre-save hook
    }

    const updatedStudent = await student.save();

    // Generate new token
    const token = generateToken(updatedStudent._id);

    res.json({
      success: true,
      message: "Profile updated successfully",
      student: {
        _id: updatedStudent._id,
        name: updatedStudent.name,
        studentId: updatedStudent.studentId,
        email: updatedStudent.email,
        dept: updatedStudent.dept,
        phone: updatedStudent.phone,
        isActive: updatedStudent.isActive,
      },
      token,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// @desc    Logout student (client-side)
// @route   POST /api/auth/logout
// @access  Private
exports.logoutStudent = async (req, res) => {
  try {
    // With JWT, logout is primarily handled client-side by removing the token
    // This endpoint can be used for logging purposes or invalidating refresh tokens

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
      error: error.message,
    });
  }
};
