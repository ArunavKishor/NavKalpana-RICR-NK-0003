import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsArrowClockwise } from "react-icons/bs";
import api from "../../config/Api";
import toast from "react-hot-toast";

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modal = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
  exit: { opacity: 0, y: 20, scale: 0.98 },
};

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

    if (isOtpVerified && formData.newPassword !== formData.cfNewPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      let res;
      if (isOtpSent) {
        if (isOtpVerified) {
          res = await api.post("/api/auth/forgetPasword", formData);
          toast.success(res.data.message);
          onClose();
        } else {
          res = await api.post("/api/auth/verifyOtp", formData);
          toast.success(res.data.message);
          setIsOtpSent(true);
          setIsOtpVerified(true);
        }
      } else {
        res = await api.post("/api/auth/genOtp", formData);
        toast.success(res.data.message);
        setIsOtpSent(true);
      } else if (!isOtpVerified) {
        res = await api.post("/auth/verifyOtp", formData);
        toast.success(res.data.message);
        setIsOtpVerified(true);
      } else {
        res = await api.post("/auth/forgetPasword", formData);
        toast.success(res.data.message);
        onClose();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const step = !isOtpSent ? 1 : !isOtpVerified ? 2 : 3;

  return (
    <AnimatePresence>
      <motion.div
        variants={backdrop}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          variants={modal}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden">

            {/* Ambient Glow */}
            <div className="absolute w-[300px] h-[300px] bg-orange-100 blur-[120px] opacity-40 -top-20 -right-20" />

            {/* Header */}
            <div className="px-8 pt-8 pb-4 text-center relative">
              <h2 className="text-2xl font-semibold text-slate-800">
                Reset Password
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                {step === 1 && "Enter your email to receive OTP"}
                {step === 2 && "Verify the OTP sent to your email"}
                {step === 3 && "Create your new secure password"}
              </p>

              <button
                onClick={onClose}
                className="absolute right-5 top-4 text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 bg-slate-50">
          <div className="flex items-center justify-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${!isOtpSent
                  ? "bg-orange-500 text-white"
                  : "bg-orange-100 text-orange-600"
                }`}
            >
              1
            </div>
            <div
              className={`h-1 w-12 rounded ${isOtpSent ? "bg-orange-500" : "bg-slate-200"
                }`}
            />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${isOtpSent && !isOtpVerified
                  ? "bg-orange-500 text-white"
                  : isOtpVerified
                    ? "bg-orange-100 text-orange-600"
                    : "bg-slate-200 text-slate-400"
                }`}
            >
              2
            </div>
            <div
              className={`h-1 w-12 rounded ${isOtpVerified ? "bg-orange-500" : "bg-slate-200"
                }`}
            />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${isOtpVerified
                  ? "bg-orange-500 text-white"
                  : "bg-slate-200 text-slate-400"
                }`}
            >
              3
            </div>
          </div>
        </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">

              {/* Email */}
              <Field label="Email Address">
                <input
                  type="email"
                  name="email"
                  required
                  disabled={isOtpSent}
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter your registered email"
                />
              </Field>

              {/* OTP */}
              <AnimatePresence>
                {isOtpSent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Field label="One-Time Password">
                      <input
                        type="text"
                        name="otp"
                        required
                        maxLength={6}
                        disabled={isOtpVerified}
                        value={formData.otp}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="Enter OTP"
                      />
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Passwords */}
              <AnimatePresence>
                {isOtpVerified && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <Field label="New Password">
                      <input
                        type="password"
                        name="newPassword"
                        required
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="Enter new password"
                      />
                    </Field>

                    <Field label="Confirm Password">
                      <input
                        type="password"
                        name="cfNewPassword"
                        required
                        value={formData.cfNewPassword}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="Confirm password"
                      />
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-orange-500 text-white font-medium shadow-lg hover:bg-orange-600 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <BsArrowClockwise className="animate-spin" />
                    Processing...
                  </>
                ) : step === 1 ? (
                  "Send OTP"
                ) : step === 2 ? (
                  "Verify OTP"
                ) : (
                  "Update Password"
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Shared Input Styles */}
        <style>{`
          .input {
            width: 100%;
            padding: 12px 14px;
            margin-top: 6px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            outline: none;
            transition: all 0.2s ease;
            background: white;
          }
          .input:focus {
            border-color: #f97316;
            box-shadow: 0 0 0 3px rgba(249,115,22,0.15);
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

/* Reusable Field Wrapper */
const Field = ({ label, children }) => (
  <div>
    <label className="text-sm font-medium text-slate-700">
      {label}
    </label>
    {children}
  </div>
);

export default ForgetPasswordModal;
