// File: src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import API from "@/api";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setIsLoading(true);
      const res = await API.post(`/api/users/forgot-password`, { email });

      if (res.data.success) {
        toast.success(res.data.message);

        // Industry-grade new path
        navigate(`/verifyOtp?email=${encodeURIComponent(email)}`);

        setIsSubmitted(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 p-6">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription className="text-slate-500">
            {isSubmitted
              ? "Check your inbox for the OTP"
              : "Enter your registered email to reset your password"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isSubmitted ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1">
                <Label>Email address</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center text-center space-y-4 py-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <h3 className="text-lg font-semibold">Check your inbox</h3>
              <p className="text-sm text-slate-600">
                An OTP has been sent to <span className="font-medium">{email}</span>
              </p>

              <button
                className="text-green-600 font-medium hover:underline"
                onClick={() => setIsSubmitted(false)}
              >
                Try another email
              </button>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-slate-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-green-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
