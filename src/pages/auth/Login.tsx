import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleGoogleAuth = () => {
    setIsLoading("google");
    window.location.href = "http://localhost:8080/api/auth/callback/google";
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email");
      return;
    }

    if (!password) {
      setEmailError("Password is required");
      return;
    }

    setIsLoading("email");
    // TODO: Connect to your email login endpoint
    console.log("Email login attempt:", { email, password });
    // window.location.href = "http://localhost:8080/api/auth/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Logo and Header */}
          <img
            src="/assets/logo.png"
            alt="Logic Q1 Logo"
            className="h-24 w-auto mx-auto drop-shadow-lg"
          />
          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                placeholder="name@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isLoading !== null}
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <a href="#" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setEmailError("");
                }}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isLoading !== null}
              />
            </div>

            {/* Error Message */}
            {emailError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{emailError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading !== null}
              className="w-full px-4 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading === "email" ? "Signing in..." : "Sign in with Email"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {/* Google Login */}
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg transition-all duration-300 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <FaGoogle className="text-lg text-blue-600" />
              <span className="font-medium text-gray-900">
                {isLoading === "google"
                  ? "Signing in..."
                  : "Sign in with Google"}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-medium text-blue-600 hover:underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
