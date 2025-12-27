// src/pages/VerifyOtp.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/Components/ui/card.jsx";
import { Input } from "@/Components/ui/input.jsx";
import { Button } from "@/Components/ui/button.jsx";
import { Label } from "@/Components/ui/label.jsx";
import { Alert, AlertDescription } from "@/Components/ui/alert.jsx";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import API from "@/api";

function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------- Guard: missing email ---------- */
  useEffect(() => {
    if (!email) {
      toast.error("Invalid verification link");
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  /* ---------- OTP change (numbers only) ---------- */
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setOtp(value);
  };

  /* ---------- Verify OTP ---------- */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Invalid request. Email missing.");
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/api/users/verify-otp", {
        email,
        otp,
      });

      if (!res.data?.success || !res.data?.resetToken) {
        throw new Error("Verification failed");
      }

      toast.success("OTP verified successfully");

      navigate(
        `/reset-password?token=${encodeURIComponent(
          res.data.resetToken
        )}`,
        { replace: true }
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid or expired OTP";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 p-6">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Verify OTP
          </CardTitle>
          {email && (
            <CardDescription>
              OTP sent to{" "}
              <span className="font-semibold">{email}</span>
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1">
              <Label>One-Time Password</Label>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={handleOtpChange}
                disabled={loading}
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default VerifyOtp;
