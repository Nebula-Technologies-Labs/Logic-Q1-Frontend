import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../../api/axios";

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

  const handleEmailLogin = async (e: React.FormEvent) => {
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

    try {
      const res = await AxiosInstance.post("/api/auth/login", { email, password });
      const token = res.data.token;
      if (token) {
        localStorage.setItem("token", token);
        navigate("/");
      } else {
        setEmailError("Invalid response from server");
      }
    } catch {
      if (import.meta.env.DEV) {
        console.warn("Dev mode: backend unavailable, using mock token");
        localStorage.setItem("token", "dev-mode-token");
        navigate("/");
      } else {
        setEmailError("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <img
            src="/assets/logo.png"
            alt="Logic Q1 Logo"
            className="h-24 w-auto mx-auto drop-shadow-lg"
          />
          <form onSubmit={handleEmailLogin} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                disabled={isLoading !== null}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                disabled={isLoading !== null}
              />
            </div>

            {emailError && (
              <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{emailError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading !== null}
              className="w-full px-4 py-3 bg-black dark:bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading === "email" ? "Signing in..." : "Sign in with Email"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <FaGoogle className="text-lg text-blue-600" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {isLoading === "google"
                  ? "Signing in..."
                  : "Sign in with Google"}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
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
