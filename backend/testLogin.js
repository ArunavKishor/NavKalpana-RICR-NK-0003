#!/usr/bin/env node

const API_URL = "http://localhost:4500";

const testLogin = async () => {
  try {
    console.log("🧪 Testing Login Endpoint...\n");

    console.log(`📍 Target: POST ${API_URL}/api/auth/login`);
    console.log(`📧 Email: admin@education.com`);
    console.log(`🔑 Password: Admin123\n`);

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@education.com",
        password: "Admin123",
      }),
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ LOGIN SUCCESSFUL!\n");
      console.log("Response:", JSON.stringify(data, null, 2));
      console.log("\n🎉 Your authentication is working perfectly!");
      console.log("Token:", data.data.token.substring(0, 20) + "...");
      process.exit(0);
    } else if (response.status === 401) {
      console.log("❌ LOGIN FAILED (401 Unauthorized)\n");
      console.log("This means either:");
      console.log("  1. The email doesn't exist");
      console.log("  2. The password is incorrect");
      console.log("  3. The user account is inactive\n");
      console.log("Response:", data);
      process.exit(1);
    } else if (response.status === 400) {
      console.log("❌ BAD REQUEST (400)\n");
      console.log("The request body is malformed.");
      console.log("Response:", data);
      process.exit(1);
    } else {
      console.log(`❌ ERROR (${response.status})\n`);
      console.log("Response:", data);
      process.exit(1);
    }
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.log("❌ CONNECTION REFUSED\n");
      console.log("The server is not running on port 4500.");
      console.log("Start it with: npm run dev (from the server folder)");
    } else {
      console.log("❌ ERROR:", error.message);
      console.log("\nFull error:", error);
    }
    process.exit(1);
  }
};

testLogin();
