import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";
import User from "./src/models/userModel.js";

dotenv.config();

const debugAuth = async () => {
  try {
    console.log("🔍 Starting Auth Debug...\n");

    // Connect to DB
    await connectDB();
    console.log("✅ Database connected\n");

    // Check for existing users
    const allUsers = await User.find().select("-password");
    console.log(`📊 Total users in database: ${allUsers.length}`);

    if (allUsers.length > 0) {
      console.log("\n📋 Existing Users:");
      allUsers.forEach((user) => {
        console.log(
          `  - ${user.fullName} (${user.email}) | Role: ${user.role} | Active: ${user.isActive}`,
        );
      });
    } else {
      console.log("⚠️  No users found in database!");
    }

    console.log("\n🧪 Testing Login with Sample Data...");

    // Test with known credentials
    const testEmail = "admin@education.com";
    const testPassword = "Admin123";

    const user = await User.findOne({ email: testEmail }).select("+password");

    if (!user) {
      console.log(`❌ User not found with email: ${testEmail}`);
      console.log("\n📝 To fix this, run: node src/seeders/seedAdmin.js");
    } else {
      console.log(`✅ User found: ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Active: ${user.isActive}`);

      // Test password comparison
      const isMatch = await user.comparePassword(testPassword);
      console.log(`   Password Match: ${isMatch ? "✅ YES" : "❌ NO"}`);

      if (isMatch) {
        console.log("\n✅ Authentication should work!");
      } else {
        console.log(
          "\n❌ Password doesn't match. Stored password hash is different from input.",
        );
      }
    }

    // Also check JWT secret
    console.log(
      `\n🔑 JWT_SECRET configured: ${process.env.JWT_SECRET ? "✅ YES" : "❌ NO"}`,
    );
    console.log(
      `🔑 MONGO_URI configured: ${process.env.MONGO_URI ? "✅ YES" : "❌ NO"}`,
    );

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

debugAuth();
