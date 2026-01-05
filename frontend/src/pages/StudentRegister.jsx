import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const StudentRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    email: "",
    password: "",
    confirmPassword: "",
    dept: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.studentId.trim())
      newErrors.studentId = "Roll number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.dept.trim()) newErrors.dept = "Department is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await axiosInstance.post("/auth/register", registerData);
      console.log(confirmPassword);
      // Store token and student info
      localStorage.setItem("studentToken", response.data.token);
      localStorage.setItem(
        "studentInfo",
        JSON.stringify(response.data.student)
      );

      // Trigger event for Navbar update
      window.dispatchEvent(new Event("student-login"));

      alert("Registration successful!");
      navigate("/student/dashboard");
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || "Registration failed",
      });
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-container-large">
        <div className="auth-header">
          <h1>📝 Student Registration</h1>
          <p>Create your library account</p>
        </div>

        {errors.submit && <div className="error-alert">{errors.submit}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className={`form-group ${errors.name ? "has-error" : ""}`}>
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div
              className={`form-group ${errors.studentId ? "has-error" : ""}`}
            >
              <label htmlFor="studentId">Roll Number *</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Enter your roll number"
              />
              {errors.studentId && (
                <span className="error-message">{errors.studentId}</span>
              )}
            </div>
          </div>

          <div className={`form-group ${errors.email ? "has-error" : ""}`}>
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-row">
            <div className={`form-group ${errors.password ? "has-error" : ""}`}>
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div
              className={`form-group ${
                errors.confirmPassword ? "has-error" : ""
              }`}
            >
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className={`form-group ${errors.dept ? "has-error" : ""}`}>
              <label htmlFor="dept">Department *</label>
              <input
                type="text"
                id="dept"
                name="dept"
                value={formData.dept}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
              />
              {errors.dept && (
                <span className="error-message">{errors.dept}</span>
              )}
            </div>

            <div className={`form-group ${errors.phone ? "has-error" : ""}`}>
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn-large btn-primary"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/student/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
