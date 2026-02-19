import React from "react";
import Header from "./components/Header";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { Toaster } from "react-hot-toast";
import AdminDashboard from "./pages/dashbords/AdminDashbord";
import AdminLogin from "./pages/AdminLogin";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/admin/DashboardHome";
import { BatchManagement, AssessmentManagement, StudentManagement, SupportRequests } from "./pages/admin/AdminPages";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminLogin />} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin-dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
          </Route>

          <Route path="/admin" element={<DashboardLayout />}>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="batches" element={<BatchManagement />} />
            <Route path="assessments" element={<AssessmentManagement />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="support" element={<SupportRequests />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
