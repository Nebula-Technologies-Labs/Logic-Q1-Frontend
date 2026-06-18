import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Mail, Lock, User } from "lucide-react";
import AxiosInstance from "../../api/axios";

const Register = () => {
 const navigate = useNavigate();
 const [isLoading, setIsLoading] = useState<string | null>(null);
 const [formData, setFormData] = useState({ name: "", email: "", password: "" });
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [agreeTerms, setAgreeTerms] = useState(false);

 const handleGoogleAuth = () => {
  setIsLoading("google");
  window.location.href = "http://localhost:8080/api/auth/callback/google";
 };

 const validateForm = () => {
  const newErrors: Record<string, string> = {};
  if (!formData.name.trim()) newErrors.name = "Name is required";
  if (!formData.email) newErrors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email";
  if (!formData.password) newErrors.password = "Password is required";
  else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
  if (!agreeTerms) newErrors.terms = "You must agree to the terms and conditions";
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
 };

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
  if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
 };

 const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;
  setIsLoading("email");
  try {
 const res = await AxiosInstance.post("/api/auth/register", formData);
 const token = res.data.token;
 if (token) { localStorage.setItem("token", token); navigate("/"); }
 else setErrors({ email: "Account created but no token returned. Please log in." });
  } catch {
 if (import.meta.env.DEV) { localStorage.setItem("token", "dev-mode-token"); localStorage.setItem("user_info", JSON.stringify({ name: formData.name, email: formData.email })); navigate("/"); }
 else setErrors({ email: "Registration failed. Please try again." });
  } finally { setIsLoading(null); }
 };

 return (
  <div className="min-h-screen flex items-center justify-center p-4 sm:p-lg py-8 bg-background">
 <div className="w-full max-w-[440px] flex flex-col gap-6">
  <div className="flex flex-col items-center text-center gap-1">
   <div className="w-12 h-12 bg-primary flex items-center justify-center mb-2 shadow-md">
  <BarChart3 size={28} className="text-on-primary" />
   </div>
   <h1 className="text-headline-lg font-headline-lg text-on-background tracking-tight">Logic Q1</h1>
   <p className="text-body-md font-body-md text-on-surface-variant max-w-[280px]">
  Create your account to get started.
   </p>
  </div>

  <div className="bg-surface-container-lowest border border-outline-variant p-6 md:p-xl shadow-[0_8px_24px_rgba(9,30,66,0.08)]">
   <form onSubmit={handleRegister} className="flex flex-col gap-4">
  <div className="flex flex-col gap-1">
   <label className="text-label-sm font-label-sm text-on-surface-variant uppercase" htmlFor="name">
    Full Name
   </label>
   <div className="relative group">
    <User size={18} className="absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
    <input
   id="name"
   type="text"
   name="name"
   value={formData.name}
   onChange={handleInputChange}
   placeholder="John Doe"
   className={`w-full pl-12 pr-4 py-[10px] bg-white border font-body-md text-body-md focus:outline-none focus:ring-2 transition-all placeholder:text-outline text-on-surface ${
    errors.name ? "border-error" : "border-outline-variant focus:border-primary focus:ring-primary/20"
   }`}
   disabled={isLoading !== null}
    />
   </div>
   {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
  </div>

  <div className="flex flex-col gap-1">
   <label className="text-label-sm font-label-sm text-on-surface-variant uppercase" htmlFor="email">
    Email Address
   </label>
   <div className="relative group">
    <Mail size={18} className="absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
    <input
   id="email"
   type="email"
   name="email"
   value={formData.email}
   onChange={handleInputChange}
   placeholder="john@company.com"
   className={`w-full pl-12 pr-4 py-[10px] bg-white border font-body-md text-body-md focus:outline-none focus:ring-2 transition-all placeholder:text-outline text-on-surface ${
    errors.email ? "border-error" : "border-outline-variant focus:border-primary focus:ring-primary/20"
   }`}
   disabled={isLoading !== null}
    />
   </div>
   {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
  </div>

  <div className="flex flex-col gap-1">
   <label className="text-label-sm font-label-sm text-on-surface-variant uppercase" htmlFor="password">
    Password
   </label>
   <div className="relative group">
    <Lock size={18} className="absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
    <input
   id="password"
   type="password"
   name="password"
   value={formData.password}
   onChange={handleInputChange}
   placeholder="••••••••"
   className={`w-full pl-12 pr-4 py-[10px] bg-white border font-body-md text-body-md focus:outline-none focus:ring-2 transition-all placeholder:text-outline text-on-surface ${
    errors.password ? "border-error" : "border-outline-variant focus:border-primary focus:ring-primary/20"
   }`}
   disabled={isLoading !== null}
    />
   </div>
   {errors.password ? <p className="text-xs text-error mt-1">{errors.password}</p> : <p className="text-xs text-on-surface-variant mt-1">At least 8 characters</p>}
  </div>

  <div className="flex items-start gap-3 pt-2">
   <input
    type="checkbox"
    id="terms"
    checked={agreeTerms}
    onChange={(e) => { setAgreeTerms(e.target.checked); if (errors.terms) { const n = { ...errors }; delete n.terms; setErrors(n); } }}
    className="mt-1 w-4 h-4 border-outline text-primary focus:ring-primary cursor-pointer"
    disabled={isLoading !== null}
   />
   <label htmlFor="terms" className="text-body-md font-body-md text-on-surface-variant cursor-pointer select-none">
    I agree to the{' '}
    <a href="#" className="text-primary hover:underline font-medium">Terms and Conditions</a>{' '}
    and{' '}
    <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
   </label>
  </div>
  {errors.terms && <p className="text-xs text-error">{errors.terms}</p>}

  <button
   type="submit"
   disabled={isLoading !== null || !agreeTerms}
   className="w-full bg-primary text-on-primary font-body-lg text-body-lg py-4 font-semibold hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all shadow-sm disabled:opacity-70"
  >
   {isLoading === "email" ? "Creating Account..." : "Create Account"}
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
   className="flex items-center justify-center gap-2 py-[10px] px-4 border border-outline-variant font-body-md text-body-md text-on-surface hover:bg-surface-container transition-colors disabled:opacity-70"
  >
   <FaGoogle className="text-lg text-primary" />
   <span>{isLoading === "google" ? "Signing up..." : "Sign up with Google"}</span>
  </button>
   </form>
  </div>

  <div className="text-center">
   <p className="font-body-md text-body-md text-on-surface-variant">
  Already have an account?{' '}
  <button onClick={() => navigate("/login")} className="text-primary font-semibold hover:underline">
   Sign in here
  </button>
   </p>
  </div>

  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
   <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-surface-container blur-3xl opacity-40" />
   <div className="absolute bottom-[5%] left-[5%] w-[300px] h-[300px] bg-secondary-container blur-3xl opacity-30" />
  </div>
 </div>
  </div>
 );
};

export default Register;

