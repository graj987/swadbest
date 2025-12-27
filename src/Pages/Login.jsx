import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/Components/ui/button.jsx";
import { Input } from "@/Components/ui/input.jsx";
import { Label } from "@/Components/ui/label.jsx";
import { Alert, AlertTitle, AlertDescription } from "@/Components/ui/alert.jsx";
import { CardContent, Card, CardHeader, CardTitle } from "@/Components/ui/card.jsx";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import API from "@/api";
import useAuth  from "../Hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const emailRef = useRef(null);

  // Auto-focus email field
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

      // Save tokens + user
      login({
        user: res.data.user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });

      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message;

      // detect unverified email
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
    <div className="min-h-screen flex items-center justify-center bg-green-100 p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Login
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
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-between text-sm">
              <Link to="/forgotpassword" className="text-green-700 hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="text-center text-sm text-gray-700">
              Don’t have an account?{" "}
              <Link to="/register" className="text-green-700 font-medium hover:underline">
                Register
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
