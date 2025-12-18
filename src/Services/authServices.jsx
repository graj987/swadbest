// src/services/authService.js
// Assumes `API` is an axios instance (e.g. export default axios.create({ baseURL }))
import API from "../api";

function formatError(err) {
  // normalize axios errors into a readable object
  if (!err) return { message: "Unknown error" };
  if (err.response) {
    // server responded with non-2xx
    return err.response.data || { message: err.response.statusText || "Server error" };
  }
  if (err.request) return { message: "No response from server" };
  return { message: err.message || "Request failed" };
}

export async function loginRequest(identifier, password) {
  try {
    const res = await API.post("/api/users/login", { identifier, password });
    return res.data;
  } catch (err) {
    throw formatError(err);
  }
}

export async function registerRequest(payload) {
  try {
    const res = await API.post("/api/users/register", payload);
    return res.data;
  } catch (err) {
    throw formatError(err);
  }
}

// If your backend expects /api/users/send-otp or /forgot-password adjust accordingly
export async function sendOtp(payload) {
  try {
    const res = await API.post("/api/users/send-otp", payload);
    return res.data;
  } catch (err) {
    throw formatError(err);
  }
}



export async function verifyOtpByEmail(email, payload) {
  try {
    const res = await API.post(`/api/users/verify-otp/${encodeURIComponent(email)}`, payload);
    return res.data;
  } catch (err) {
    throw formatError(err);
  }
}

export async function forgotPassword(payload) {
  try {
    const res = await API.post("/api/users/forgot-password", payload);
    return res.data;
  } catch (err) {
    throw formatError(err);
  }
}

// resetPasswordLink: resets using a link (token in body)
// resetPasswordOtp: resets using otp route
export async function resetPasswordLink(payload) {
  try {
    const res = await API.post("/api/users/reset-password", payload);
    return res.data;
  } catch (err) {
    throw formatError(err);
  }
}

export async function resetPasswordOtp(payload) {
  try {
    const res = await API.post("/api/users/reset-password-otp", payload);
    return res.data;
  } catch (err) {
    throw formatError(err);
  }
}

// optional convenience default export
export default {
  loginRequest,
  registerRequest,
  sendOtp,
  verifyOtpByEmail,
  forgotPassword,
  resetPasswordLink,
  resetPasswordOtp,
};
