import React, { useState } from "react";
import { Button } from "@/Components/ui/button.jsx";
import API from "@/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card.jsx";
import { Input } from "@/Components/ui/input.jsx";
import { Label } from "@/Components/ui/label.jsx";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  /* ======================================
        HANDLE CHANGE
  ====================================== */
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ======================================
        HANDLE SUBMIT
  ====================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);

      const res = await API.post("/api/users/register", formData);

      if (res.data?.success) {
        toast.success("Registration successful! Please verify your email.");

        // Navigate WITH email so verification screen knows who to show
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast.error(res.data?.message || "Registration failed");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Server error during registration";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

 return (
  <div
    className="min-h-screen flex items-center justify-center 
    bg-[oklch(0.21_0.034_264.665)] p-6"
  >
    <Card className="w-full max-w-md shadow-2xl rounded-2xl border border-black/10 bg-white">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-extrabold text-[oklch(0.21_0.034_264.665)]">
          Create your account
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm">
          Register to continue
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">

          {/* NAME */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="focus-visible:ring-[oklch(0.705_0.213_47.604)]"
            />
          </div>

          {/* EMAIL */}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="focus-visible:ring-[oklch(0.705_0.213_47.604)]"
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <Label htmlFor="password" className="font-medium">Password</Label>

            <div className="relative ">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                className="focus-visible:ring-[oklch(0.705_0.213_47.604)]"
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-3 top-1/2 -translate-y-1/2 
                text-gray-600 hover:bg-transparent"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="flex flex-col gap-3">

          {/* SIGN UP BUTTON */}
          <Button
            type="submit"
            className="w-full py-3 rounded-xl text-white text-base font-semibold 
            bg-[oklch(0.705_0.213_47.604)] hover:bg-[oklch(0.705_0.213_47.604)/80]
            transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing up...
              </>
            ) : (
              "Sign up"
            )}
          </Button>

          {/* LOGIN REDIRECT */}
          <p className="text-center text-sm text-gray-700">
            Already have an account?{" "}
            <Link to="/login" className="text-[oklch(0.705_0.213_47.604)] font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  </div>
);

};

export default Register;
