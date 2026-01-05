const mongoose = require("mongoose");

const borrowSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    returnDate: {
      type: Date,
      default: function () {
        const date = new Date();
        date.setDate(date.getDate() + 14); // 14 days borrowing period
        return date;
      },
    },
    status: {
      type: String,
      enum: ["active", "returned"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Borrow", borrowSchema);
