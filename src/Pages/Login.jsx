import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/Components/ui/button.jsx";
import { Input } from "@/Components/ui/input.jsx";
import { Label } from "@/Components/ui/label.jsx";
import { Alert, AlertTitle, AlertDescription } from "@/Components/ui/alert.jsx";
import { CardContent, Card, CardHeader, CardTitle } from "@/Components/ui/card.jsx";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import API from "@/api";
import useAuth from "../Hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const emailRef = useRef(null);

  React.useEffect(() => {
    if (emailRef.current) emailRef.current.focus();
  }, []);

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.email.trim() || !form.password.trim()) {
      setError("Both fields are required");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/api/users/login", form);

      if (!res.data?.success) {
        setError(res.data?.message || "Login failed");
        return;
      }

      login({
        user: res.data.user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });

      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message;

      if (msg?.toLowerCase().includes("verify")) {
        setError("Your email is not verified. Please verify your email.");
      } else {
        setError(msg || "Server error during login");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center 
      bg-[oklch(0.21_0.034_264.665)] p-6"
    >
      <Card className="w-full max-w-md shadow-2xl rounded-2xl border border-black/10 bg-white">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-center text-[oklch(0.21_0.034_264.665)]">
            Welcome Back
          </CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={onSubmit} className="space-y-5">

            {/* EMAIL */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                ref={emailRef}
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={onChange}
                className="focus-visible:ring-[oklch(0.705_0.213_47.604)]"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange}
                  className="focus-visible:ring-[oklch(0.705_0.213_47.604)]"
                  required
                />

                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-between text-sm">
              <Link
                to="/forgotpassword"
                className="text-[oklch(0.705_0.213_47.604)] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              className="w-full py-3 rounded-xl text-white text-base font-semibold 
              bg-[oklch(0.705_0.213_47.604)] hover:bg-[oklch(0.705_0.213_47.604)/80]
              transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="text-center text-sm text-gray-700">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-[oklch(0.705_0.213_47.604)] font-medium hover:underline"
              >
                Register
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
