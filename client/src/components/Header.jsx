import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import tranparentLogo from "../assets/tranparentLogo.png";

const Header = () => {
  const { user, isLogin, role } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = () => {
    switch (role) {
      case "partner":
        navigate("/rider-dashboard");
        break;
      case "admin":
        navigate("/admin-dashboard");
        break;
      case "student":
        navigate("/student-dashboard");
        break;
      default:
        navigate("/");
        break;
    }
  };

  return (
    <header className="bg-slate-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={tranparentLogo}
            alt="NavKalpana Logo"
            className="h-12 w-20 object-cover"
          />
          {/* <span className="text-white font-semibold text-lg hidden sm:block">
            NavKalpana
          </span> */}
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-slate-200 hover:text-orange-400 transition font-medium"
          >
            Home
          </Link>
          <Link
            to="/courses"
            className="text-slate-200 hover:text-orange-400 transition font-medium"
          >
            Courses
          </Link>
          <Link
            to="/contact"
            className="text-slate-200 hover:text-orange-400 transition font-medium"
          >
            Contact Us
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {isLogin ? (
            <div
              onClick={handleNavigate}
              className="text-white font-semibold cursor-pointer hover:text-orange-400 transition"
            >
              {user?.fullName || user?.name || "Dashboard"}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-orange-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
