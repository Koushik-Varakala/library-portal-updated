const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";
let authToken = "";
let studentId = "";

// ANSI color codes for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

// Test data
const testStudent = {
  name: "Test Student",
  studentId: "TEST2024001",
  email: "test@example.com",
  password: "password123",
  dept: "Computer Science",
  phone: "1234567890",
};

// Helper function to make requests
const makeRequest = async (method, endpoint, data = null, useAuth = false) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {},
    };

    if (useAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
      config.headers["Content-Type"] = "application/json";
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

// Test 1: Register Student
const testRegister = async () => {
  log.info("Test 1: Registering new student...");

  const result = await makeRequest("POST", "/auth/register", testStudent);

  if (result.success && result.data.token) {
    authToken = result.data.token;
    studentId = result.data.student._id;
    log.success("Registration successful");
    log.info(`Token: ${authToken.substring(0, 20)}...`);
    log.info(`Student ID: ${studentId}`);
    return true;
  } else {
    log.error("Registration failed");
    console.log(result.error);
    return false;
  }
};

// Test 2: Login Student
const testLogin = async () => {
  log.info("\nTest 2: Logging in...");

  const result = await makeRequest("POST", "/auth/login", {
    email: testStudent.email,
    password: testStudent.password,
  });

  if (result.success && result.data.token) {
    authToken = result.data.token;
    log.success("Login successful");
    log.info(`New Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    log.error("Login failed");
    console.log(result.error);
    return false;
  }
};

// Test 3: Get Profile (Protected Route)
const testGetProfile = async () => {
  log.info("\nTest 3: Getting profile (protected route)...");

  const result = await makeRequest("GET", "/auth/profile", null, true);

  if (result.success) {
    log.success("Profile retrieved successfully");
    console.log("Student Info:", result.data.student);
    return true;
  } else {
    log.error("Failed to get profile");
    console.log(result.error);
    return false;
  }
};

// Test 4: Update Profile (Protected Route)
const testUpdateProfile = async () => {
  log.info("\nTest 4: Updating profile...");

  const result = await makeRequest(
    "PUT",
    "/auth/profile",
    {
      name: "Updated Test Student",
      phone: "9876543210",
    },
    true
  );

  if (result.success) {
    log.success("Profile updated successfully");
    console.log("Updated Info:", result.data.student);
    return true;
  } else {
    log.error("Failed to update profile");
    console.log(result.error);
    return false;
  }
};

// Test 5: Access Protected Route Without Token
const testUnauthorizedAccess = async () => {
  log.info("\nTest 5: Testing unauthorized access...");

  const originalToken = authToken;
  authToken = ""; // Remove token

  const result = await makeRequest("GET", "/auth/profile", null, true);

  authToken = originalToken; // Restore token

  if (!result.success && result.error.message?.includes("token")) {
    log.success("Unauthorized access properly blocked");
    console.log("Error:", result.error.message);
    return true;
  } else {
    log.error("Unauthorized access was not blocked!");
    return false;
  }
};

// Test 6: Test Invalid Token
const testInvalidToken = async () => {
  log.info("\nTest 6: Testing invalid token...");

  const originalToken = authToken;
  authToken = "invalid.token.here";

  const result = await makeRequest("GET", "/auth/profile", null, true);

  authToken = originalToken;

  if (!result.success && result.error.message?.includes("Invalid")) {
    log.success("Invalid token properly rejected");
    console.log("Error:", result.error.message);
    return true;
  } else {
    log.error("Invalid token was not rejected!");
    return false;
  }
};

// Test 7: Test Duplicate Registration
const testDuplicateRegistration = async () => {
  log.info("\nTest 7: Testing duplicate registration...");

  const result = await makeRequest("POST", "/auth/register", testStudent);

  if (!result.success && result.error.message?.includes("already")) {
    log.success("Duplicate registration properly prevented");
    console.log("Error:", result.error.message);
    return true;
  } else {
    log.error("Duplicate registration was not prevented!");
    return false;
  }
};

// Test 8: Test Wrong Password
const testWrongPassword = async () => {
  log.info("\nTest 8: Testing wrong password...");

  const result = await makeRequest("POST", "/auth/login", {
    email: testStudent.email,
    password: "wrongpassword",
  });

  if (!result.success && result.error.message?.includes("Invalid")) {
    log.success("Wrong password properly rejected");
    console.log("Error:", result.error.message);
    return true;
  } else {
    log.error("Wrong password was not rejected!");
    return false;
  }
};

// Test 9: Test Non-existent User
const testNonExistentUser = async () => {
  log.info("\nTest 9: Testing non-existent user login...");

  const result = await makeRequest("POST", "/auth/login", {
    email: "nonexistent@example.com",
    password: "password123",
  });

  if (!result.success && result.error.message?.includes("Invalid")) {
    log.success("Non-existent user login properly rejected");
    console.log("Error:", result.error.message);
    return true;
  } else {
    log.error("Non-existent user login was not rejected!");
    return false;
  }
};

// Test 10: Test Weak Password
const testWeakPassword = async () => {
  log.info("\nTest 10: Testing weak password registration...");

  const result = await makeRequest("POST", "/auth/register", {
    ...testStudent,
    email: "weakpass@example.com",
    studentId: "WEAK001",
    password: "12345", // Less than 6 characters
  });

  if (!result.success && result.error.message?.includes("6 characters")) {
    log.success("Weak password properly rejected");
    console.log("Error:", result.error.message);
    return true;
  } else {
    log.error("Weak password was not rejected!");
    return false;
  }
};

// Main test runner
const runAllTests = async () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 STARTING AUTHENTICATION SYSTEM TESTS");
  console.log("=".repeat(60) + "\n");

  const tests = [
    { name: "Register", fn: testRegister },
    { name: "Login", fn: testLogin },
    { name: "Get Profile", fn: testGetProfile },
    { name: "Update Profile", fn: testUpdateProfile },
    { name: "Unauthorized Access", fn: testUnauthorizedAccess },
    { name: "Invalid Token", fn: testInvalidToken },
    { name: "Duplicate Registration", fn: testDuplicateRegistration },
    { name: "Wrong Password", fn: testWrongPassword },
    { name: "Non-existent User", fn: testNonExistentUser },
    { name: "Weak Password", fn: testWeakPassword },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      log.error(`Test "${test.name}" threw an error: ${error.message}`);
      results.push({ name: test.name, passed: false });
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((result, index) => {
    const status = result.passed
      ? colors.green + "✓ PASS"
      : colors.red + "✗ FAIL";
    console.log(`${index + 1}. ${result.name}: ${status}${colors.reset}`);
  });

  console.log("\n" + "-".repeat(60));
  console.log(`Total: ${passed}/${total} tests passed`);

  if (passed === total) {
    log.success(
      "🎉 ALL TESTS PASSED! Authentication system is working correctly."
    );
  } else {
    log.error(
      `⚠️  ${total - passed} test(s) failed. Please check the issues above.`
    );
  }

  console.log("=".repeat(60) + "\n");
};

// Check if server is running
const checkServer = async () => {
  try {
    const response = await axios.get("http://localhost:5000/");
    log.success("Backend server is running");
    return true;
  } catch (error) {
    log.error("Backend server is not running!");
    log.info("Please start the server with: npm run dev");
    return false;
  }
};

// Run tests
(async () => {
  const serverRunning = await checkServer();

  if (serverRunning) {
    await runAllTests();
  }

  process.exit(0);
})();
