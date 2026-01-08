import React from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/Components/ui/button.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">

        {/* Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <MailCheck className="h-8 w-8 text-green-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900">
          Verify your email address
        </h1>

        {/* Description */}
        <p className="mt-3 text-gray-600 text-sm leading-relaxed">
          We’ve sent a verification link to the email address below.
          Please open your inbox and click the link to activate your account.
        </p>

        {/* Email box */}
        <div className="mt-4 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 break-all">
          {email || "your email address"}
        </div>

        {/* Help text */}
        <div className="mt-5 text-sm text-gray-500 space-y-1">
          <p>• Check your spam or promotions folder</p>
          <p>• Make sure the email address is correct</p>
        </div>

        {/* CTA */}
        <Button
          className="w-full mt-7 bg-green-600 hover:bg-green-700"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </Button>

        {/* Secondary action */}
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          Back to Home
        </button>

      </div>
    </main>
  );
};

export default VerifyEmail;
