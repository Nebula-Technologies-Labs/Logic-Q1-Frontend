import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleGoogleAuth = () => {
    setIsLoading("google");
    window.location.href = "http://localhost:8080/api/auth/callback/google";
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!agreeTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading("email");
    // TODO: Connect to your registration endpoint
    console.log("Registration attempt:", formData);
    // window.location.href = "http://localhost:8080/api/auth/register";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      {/* Register Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
            <img
              src="/assets/logo.png"
              alt="Logic Q1 Logo"
              className="h-24 w-auto mx-auto drop-shadow-lg mb-2"
            />
          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* First Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                   errors.name ? "border-red-500" : "border-gray-300"
                 }`}
                 disabled={isLoading !== null}
               />
               {errors.name && (
                 <p className="text-xs text-red-600 mt-1">{errors.name}</p>
               )}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                   errors.email ? "border-red-500" : "border-gray-300"
                 }`}
                 disabled={isLoading !== null}
               />
               {errors.email && (
                 <p className="text-xs text-red-600 mt-1">{errors.email}</p>
               )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                   errors.password ? "border-red-500" : "border-gray-300"
                 }`}
                 disabled={isLoading !== null}
               />
               {errors.password && (
                 <p className="text-xs text-red-600 mt-1">{errors.password}</p>
               )}
               <p className="text-xs text-gray-500 mt-1">
                At least 8 characters
              </p>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.terms) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.terms;
                      return newErrors;
                    });
                  }
                }}
                className="mt-1 cursor-pointer"
                disabled={isLoading !== null}
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{" "}
                 <a
                   href="#"
                   className="text-blue-600 hover:underline font-medium"
                 >
                   Terms and Conditions
                 </a>{" "}
                 and{" "}
                 <a
                   href="#"
                   className="text-blue-600 hover:underline font-medium"
                 >
                   Privacy Policy
                 </a>
              </label>
            </div>
            {errors.terms && (
               <p className="text-xs text-red-600 mt-1">{errors.terms}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading !== null}
              className="w-full px-4 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {isLoading === "email" ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs font-medium text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          {/* Social Registration Buttons */}
          <div className="space-y-2 mb-6">
            {/* Google Sign Up */}
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <FaGoogle className="text-lg text-blue-600" />
              <span className="font-medium text-gray-900">
                {isLoading === "google"
                  ? "Signing up..."
                  : "Sign up with Google"}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-medium text-blue-600 hover:underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
