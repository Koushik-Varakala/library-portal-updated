import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [isStudentAuthenticated, setIsStudentAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const studentToken = localStorage.getItem("studentToken");
    const studentInfo = localStorage.getItem("studentInfo");
    const adminLoggedIn = localStorage.getItem("adminLoggedIn");

    if (studentToken && studentInfo) {
      setStudent(JSON.parse(studentInfo));
      setIsStudentAuthenticated(true);
    }

    if (adminLoggedIn === "true") {
      setIsAdminAuthenticated(true);
    }

    setLoading(false);
  }, []);

  // Student login
  const loginStudent = (studentData, token) => {
    localStorage.setItem("studentToken", token);
    localStorage.setItem("studentInfo", JSON.stringify(studentData));
    setStudent(studentData);
    setIsStudentAuthenticated(true);
  };

  // Student logout
  const logoutStudent = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentInfo");
    setStudent(null);
    setIsStudentAuthenticated(false);
  };

  // Admin login
  const loginAdmin = () => {
    localStorage.setItem("adminLoggedIn", "true");
    setIsAdminAuthenticated(true);
  };

  // Admin logout
  const logoutAdmin = () => {
    localStorage.removeItem("adminLoggedIn");
    setIsAdminAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        student,
        isStudentAuthenticated,
        isAdminAuthenticated,
        loading,
        loginStudent,
        logoutStudent,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
