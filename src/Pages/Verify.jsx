import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/Components/ui/button.jsx";
import API from "@/api";

const Verify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  // loading | success | failed

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("failed");
        return;
      }

      try {
        const res = await API.get(`/api/users/verify?token=${token}`);

        if (res.data?.success) {
          setStatus("success");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setStatus("failed");
        }
      } catch (error) {
        setStatus("failed", error);
      }

    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">

        {/* LOADING STATE */}
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 mx-auto text-green-600 animate-spin" />
            <h2 className="text-xl font-semibold">Verifying your email...</h2>
            <p className="text-gray-600">Please wait a moment.</p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <div className="space-y-4">
            <ShieldCheck className="h-12 w-12 mx-auto text-green-600" />
            <h2 className="text-xl font-semibold text-green-700">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600">Redirecting you to login...</p>
          </div>
        )}

        {/* FAILED STATE */}
        {status === "failed" && (
          <div className="space-y-4">
            <XCircle className="h-12 w-12 mx-auto text-red-500" />
            <h2 className="text-xl font-semibold text-red-600">
              Verification Failed
            </h2>
            <p className="text-gray-600">
              The verification link is invalid or expired.
            </p>

            <Button
              className="bg-green-600 hover:bg-green-500 w-full"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Verify;
