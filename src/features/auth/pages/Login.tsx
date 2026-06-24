import {
    useState,
    type FormEvent,
} from "react";

import {
    FaGoogle,
} from "react-icons/fa";

import {
    FiLock,
    FiMail,
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
            const message = cause instanceof Error ? cause.message : "Sign in failed. Please check your credentials and try again.";
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white shadow-2xl rounded-3xl p-10 border border-gray-100">
                    <div className="text-center mb-10">
                        <img src="/assets/logo.png" alt="LogicQ1" className="h-20 mx-auto mb-5" />
                        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                        <p className="text-gray-500 mt-2">Sign in to continue to your workspace</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    disabled={submitting !== null}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                            </div>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    disabled={submitting !== null}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {error ? (
                            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
                                {error}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={submitting !== null}
                            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting === "email" ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="flex items-center my-8">
                        <div className="flex-1 border-t border-gray-200" />
                        <span className="px-4 text-sm text-gray-400">OR</span>
                        <div className="flex-1 border-t border-gray-200" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={submitting !== null}
                        className="w-full py-3 border border-gray-300 rounded-xl flex items-center justify-center gap-3 font-medium hover:bg-gray-50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaGoogle className="text-lg" />
                        {submitting === "google" ? "Redirecting..." : "Continue with Google"}
                    </button>
                </div>

                <div className="mt-8 text-center text-gray-600">
                    Don't have an account?
                    <Link to="/register" className="ml-2 font-semibold text-blue-600 hover:text-blue-700">
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

