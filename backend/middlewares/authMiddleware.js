const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.student = await Student.findById(decoded.id).select("-password");

      if (!req.student) {
        return res.status(401).json({
          success: false,
          message: "Student not found",
        });
      }
      if (!req.student.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated. Please contact admin.",
        });
      }
      next();
    } catch (error) {
      console.error("Token verification error:", error);

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired. Please login again.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};
