import React from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/Components/ui/button.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">

        <MailCheck className="h-14 w-14 mx-auto text-green-600 mb-4" />

        <h2 className="text-2xl font-bold text-green-700">
          Verify Your Email
        </h2>

        <p className="text-gray-600 mt-3">
          We've sent a verification link to:
        </p>

        <p className="text-gray-900 font-semibold mt-1">
          {email || "your email address"}
        </p>

        <p className="text-gray-500 mt-4">
          Please check your inbox (and spam folder).  
          Click the verification button in the email to activate your account.
        </p>

        <Button
          className="w-full bg-green-600 hover:bg-green-500 mt-6"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </Button>
      </div>
    </div>
  );
};

export default VerifyEmail;
