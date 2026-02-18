import React, { useState } from "react";
import { BsArrowClockwise } from "react-icons/bs";
import api from "../../config/Api";
import toast from "react-hot-toast";

const ForgetPasswordModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    cfNewPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.newPassword !== formData.cfNewPassword) {
      toast.error("New Password and Confirm Password Must be Same");
      setLoading(false);
      return;
    }

    try {
      let res;
      if (isOtpSent) {
        if (isOtpVerified) {
          res = await api.post("/auth/forgetPasword", formData);
          toast.success(res.data.message);
          onClose();
        } else {
          res = await api.post("/auth/verifyOtp", formData);
          toast.success(res.data.message);
          setIsOtpSent(true);
          setIsOtpVerified(true);
        }
      } else {
        res = await api.post("/auth/genOtp", formData);
        toast.success(res.data.message);
        setIsOtpSent(true);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Unknown Error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Reset Password
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {!isOtpSent
                ? "Enter your email to receive OTP"
                : isOtpVerified
                  ? "Create a new password"
                  : "Verify OTP sent to your email"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-3xl transition leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 bg-slate-50">
          <div className="flex items-center justify-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${
                !isOtpSent
                  ? "bg-orange-500 text-white"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              1
            </div>
            <div
              className={`h-1 w-12 rounded ${
                isOtpSent ? "bg-orange-500" : "bg-slate-200"
              }`}
            />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${
                isOtpSent && !isOtpVerified
                  ? "bg-orange-500 text-white"
                  : isOtpVerified
                    ? "bg-orange-100 text-orange-600"
                    : "bg-slate-200 text-slate-400"
              }`}
            >
              2
            </div>
            <div
              className={`h-1 w-12 rounded ${
                isOtpVerified ? "bg-orange-500" : "bg-slate-200"
              }`}
            />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${
                isOtpVerified
                  ? "bg-orange-500 text-white"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              3
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isOtpSent}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
              placeholder="Enter your registered email"
            />
          </div>

          {/* OTP Input */}
          {isOtpSent && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                One-Time Password (OTP)
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                required
                disabled={isOtpVerified}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
              />
              <p className="text-xs text-slate-500 mt-2">
                Check your email for the verification code
              </p>
            </div>
          )}

          {/* New Password Inputs */}
          {isOtpSent && isOtpVerified && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="cfNewPassword"
                  value={formData.cfNewPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">
                    <BsArrowClockwise size={18} />
                  </span>
                  <span>Processing...</span>
                </>
              ) : isOtpSent ? (
                isOtpVerified ? (
                  "Update Password"
                ) : (
                  "Verify OTP"
                )
              ) : (
                "Send OTP"
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ForgetPasswordModal;
