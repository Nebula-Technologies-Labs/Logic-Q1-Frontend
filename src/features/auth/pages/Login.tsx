import {
    useState,
    type FormEvent,
} from "react";
import { isAxiosError } from "axios";

import {
    FaGoogle,
} from "react-icons/fa";

import {
    FiEye,
    FiEyeOff,
} from "react-icons/fi";

import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../hooks";

import {
    emailLogin,
    startGoogleOAuth,
} from "../api";

type LocationState = {
    from?: {
        pathname?: string;
    };
};

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const from = (location.state as LocationState | null)?.from?.pathname ?? "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState<"email" | "google" | null>(null);
    const [error, setError] = useState<string | null>(null);

    const emailLoginHandler = async (): Promise<boolean> => {
        setError(null);
        setSubmitting("email");

        try {
            const { token } = await emailLogin({
                email: email.trim(),
                password,
            });

            if (!token) {
                setError("Authentication token was not returned by the server.");
                return false;
            }

            await login(token);
            return true;
        } catch (cause) {
            let message = "Sign in failed. Please check your credentials and try again.";
            if (isAxiosError(cause) && cause.response?.data?.message) {
                message = cause.response.data.message;
            } else if (cause instanceof Error) {
                message = cause.message;
            }
            setError(message);
            return false;
        } finally {
            setSubmitting(null);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const success = await emailLoginHandler();
        if (success) {
            navigate(from, { replace: true });
        }
    };

    const handleGoogleLogin = () => {
        setSubmitting("google");
        startGoogleOAuth();
    };

    return (
        <div className="min-h-screen bg-[#F0F5FE] relative overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sans text-[#0D1625]">
            {/* Background effects */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/60 via-[#F0F5FE] to-[#F0F5FE]"></div>
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/50 to-transparent z-0 pointer-events-none"></div>

            <div className="w-full max-w-[440px] z-10">
                <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 border border-[#C4D5F1] transition-all duration-300">
                    <div className="text-center mb-8">
                        <img src="/assets/logo.png" alt="LogicQ1" className="h-10 mx-auto mb-5 object-contain" />
                        <div className="inline-flex items-center justify-center px-3 py-1 mb-5 text-[11px] font-semibold tracking-widest text-[#334056] uppercase bg-[#F0F5FE] border border-[#C4D5F1] rounded-full">
                            CRM Workspace
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#0D1625] tracking-tight">Welcome Back</h1>
                        <p className="text-[#334056] text-sm mt-2">Sign in to continue to your workspace</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                disabled={submitting !== null}
                                className="block w-full h-[44px] px-3.5 pt-4 pb-1 text-[14px] text-[#0D1625] bg-transparent border border-[#C4D5F1] rounded-[12px] appearance-none focus:outline-none focus:border-[#1E293B] focus:shadow-[0_4px_14px_rgba(0,0,0,0.05)] peer transition-all duration-300"
                                placeholder=" "
                                required
                            />
                            <label
                                htmlFor="email"
                                className="absolute left-3.5 text-[#64748B] font-normal transition-[top,color] duration-200 pointer-events-none top-1 text-[11px] peer-placeholder-shown:top-[14px] peer-placeholder-shown:text-[14px] peer-focus:top-1 peer-focus:text-[11px] peer-focus:text-[#1E293B]"
                            >
                                Email
                            </label>
                        </div>

                        <div className="relative group">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                disabled={submitting !== null}
                                className="block w-full h-[44px] pl-3.5 pr-10 pt-4 pb-1 text-[14px] text-[#0D1625] bg-transparent border border-[#C4D5F1] rounded-[12px] appearance-none focus:outline-none focus:border-[#1E293B] focus:shadow-[0_4px_14px_rgba(0,0,0,0.05)] peer transition-all duration-300"
                                placeholder=" "
                                required
                            />
                            <label
                                htmlFor="password"
                                className="absolute left-3.5 text-[#64748B] font-normal transition-[top,color] duration-200 pointer-events-none top-1 text-[11px] peer-placeholder-shown:top-[14px] peer-placeholder-shown:text-[14px] peer-focus:top-1 peer-focus:text-[11px] peer-focus:text-[#1E293B]"
                            >
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute cursor-pointer right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] transition-colors focus:outline-none"
                            >
                                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                            </button>
                        </div>

                        {error ? (
                            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm transition-all duration-300">
                                {error}
                            </div>
                        ) : null}

                        <div className="flex justify-end pt-1 pb-2">
                            <Link to="/forgot-password" className="text-sm font-medium text-[#334056] hover:text-[#1E293B] transition-colors duration-200">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting !== null}
                            className="w-full h-[44px] px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[12px] font-semibold text-[14px] transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 group"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {submitting === "email" ? "Signing in..." : "Sign In"}
                                {submitting !== "email" && (
                                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                                )}
                            </span>
                        </button>
                    </form>

                    <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#C4D5F1]"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-[#334056] text-xs font-medium uppercase tracking-wider">Or</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={submitting !== null}
                        className="w-full h-[44px] px-4 bg-white border border-[#C4D5F1] shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.06)] hover:border-[#1E293B] hover:bg-[#F0F5FE]/50 text-[#0D1625] rounded-[12px] font-medium text-[14px] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        <FaGoogle className="text-lg text-[#334056] group-hover:text-[#0D1625] transition-colors" />
                        {submitting === "google" ? "Redirecting..." : "Continue with Google"}
                    </button>
                </div>

                <div className="mt-8 text-center text-[14px] text-[#334056]">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-semibold text-[#1E293B] hover:text-[#0D1625] transition-colors group inline-flex items-center">
                        Create Account
                        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 ml-1">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

