import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Mail, Lock } from "lucide-react";
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

    if (!email) { setEmailError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError("Please enter a valid email"); return; }
    if (!password) { setEmailError("Password is required"); return; }

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
        localStorage.setItem("token", "dev-mode-token");
        localStorage.setItem("user_info", JSON.stringify({ name: email.split("@")[0], email }));
        navigate("/");
      } else {
        setEmailError("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-lg bg-background">
      <div className="w-full max-w-[440px] flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-1">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2 shadow-md">
            <BarChart3 size={28} className="text-on-primary" />
          </div>
          <h1 className="text-headline-lg font-headline-lg text-on-background tracking-tight">Logic Q1</h1>
          <p className="text-body-md font-body-md text-on-surface-variant max-w-[280px]">
            Enterprise productivity and institutional precision for modern teams.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-xl shadow-[0_8px_24px_rgba(9,30,66,0.08)]">
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-label-sm font-label-sm text-on-surface-variant uppercase" htmlFor="email">
                Work Email
              </label>
              <div className="relative group">
                <Mail size={18} className="absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-[10px] bg-white border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline text-on-surface"
                  disabled={isLoading !== null}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-label-sm font-label-sm text-primary hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setEmailError(""); }}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-[10px] bg-white border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline text-on-surface"
                  disabled={isLoading !== null}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded-sm border-outline text-primary focus:ring-primary"
              />
              <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember">
                Remember me for 30 days
              </label>
            </div>

            {emailError && (
              <div className="px-4 py-3 bg-error-container border border-error/20 rounded-lg">
                <p className="text-sm text-error">{emailError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading !== null}
              className="w-full bg-primary text-on-primary font-body-lg text-body-lg py-4 rounded-lg font-semibold hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all shadow-sm disabled:opacity-70"
            >
              {isLoading === "email" ? "Signing in..." : "Sign In"}
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-outline-variant" />
              <span className="text-label-sm font-label-sm text-outline uppercase">Or continue with</span>
              <div className="h-px flex-1 bg-outline-variant" />
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-2 py-[10px] px-4 border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface hover:bg-surface-container transition-colors disabled:opacity-70"
            >
              <FaGoogle className="text-lg text-primary" />
              <span>{isLoading === "google" ? "Signing in..." : "Google"}</span>
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-2 items-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Don't have an account?{' '}
            <button onClick={() => navigate("/register")} className="text-primary font-semibold hover:underline">
              Request Access
            </button>
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-label-sm font-label-sm text-outline hover:text-on-surface">Privacy Policy</a>
            <span className="text-outline-variant">•</span>
            <a href="#" className="text-label-sm font-label-sm text-outline hover:text-on-surface">Terms of Service</a>
          </div>
        </div>

        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-surface-container rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-[5%] left-[5%] w-[300px] h-[300px] bg-secondary-container rounded-full blur-3xl opacity-30" />
        </div>
      </div>
    </div>
  );
};

export default Login;
