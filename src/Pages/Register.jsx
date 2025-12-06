import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  // normalize client-side
  const name = String(formData.name || "").trim();
  const email = String(formData.email || "").trim().toLowerCase();
  const password = String(formData.password || "");
  const confirmPassword = String(formData.confirmPassword || "");

  // quick client-side validation
  if (!name || !email || !password || !confirmPassword) {
    setError("Please fill all fields.");
    return;
  }
  if (password !== confirmPassword) {
    setError("Passwords do not match!");
    return;
  }
  if (password.length < 8) {
    setError("Password should be at least 8 characters.");
    return;
  }
  // basic email regex (not perfect but useful client-side)
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    setError("Please enter a valid email address.");
    return;
  }

  setLoading(true);
  try {
    // send a clean payload (no confirmPassword)
    const payload = { name, email, password: password.trim() };

    const res = await API.post("/api/users/register", payload);

    if (res.status === 201) {
      setSuccess("Registration successful! Redirecting to login...");
      // small delay so user sees success
      setTimeout(() => navigate("/login"), 1500);
    } else {
      // handle unexpected 2xx response shapes
      setSuccess("Registration completed. Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    }
  } catch (err) {
    console.error("Register error:", err?.response?.data || err);
    // Prefer server-provided friendly message; fallback to generic text
    const serverMsg = err.response?.data?.message;
    if (serverMsg) setError(String(serverMsg));
    else if (err.response) setError(`Registration failed: ${err.response.status}`);
    else setError("Registration failed. Check your network and try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border border-orange-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-orange-600">
          Create Your SwadBest Account
        </h2>

        {error && <div className="text-red-500 text-center mb-4 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-center mb-4 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-orange-500 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
