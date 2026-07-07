import { useState, type ChangeEvent, type FormEvent } from "react";
import { isAxiosError } from "axios";

import { FaGoogle } from "react-icons/fa";

import { FiEye, FiEyeOff } from "react-icons/fi";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks";

import { register as registerAccount, startGoogleOAuth } from "../api/auth.service";

import { validateRegister, type RegistrationForm } from "../validators/register.validator";

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState<RegistrationForm>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    const [agreeTerms, setAgreeTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState<"email" | "google" | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const nextErrors = validateRegister(formData, agreeTerms);
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = event.target;

        if (name === "terms") {
            setAgreeTerms(checked);
            setErrors((previous) => {
                const next = { ...previous };
                delete next.terms;
                return next;
            });
            return;
        }

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((previous) => ({
                ...previous,
                [name]: "",
            }));
        }
    };

    const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting("email");
        setErrors({});

        try {
            const { token } = await registerAccount({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            if (!token) {
                throw new Error("Registration succeeded but no token was returned.");
            }

            await login(token);
            navigate("/dashboard", { replace: true });
        } catch (cause) {
            let message = "Registration failed. Please try again.";
            if (isAxiosError(cause) && cause.response?.data?.message) {
                message = cause.response.data.message;
            } else if (cause instanceof Error) {
                message = cause.message;
            }
            setErrors((previous) => ({
                ...previous,
                form: message,
            }));
        } finally {
            setSubmitting(null);
        }
    };

    const handleGoogleAuth = () => {
        setSubmitting("google");
        startGoogleOAuth();
    };

    return (
        <div className="min-h-screen bg-[#F0F5FE] relative overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sans text-[#0D1625]">
            {/* Background effects */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/60 via-[#F0F5FE] to-[#F0F5FE]"></div>
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/50 to-transparent z-0 pointer-events-none"></div>

            <div className="w-full max-w-[440px] z-10 py-4">
                <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 border border-[#C4D5F1] transition-all duration-300">
                    <div className="text-center mb-8">
                        <img
                            src="/assets/logo.png"
                            alt="LogicQ1"
                            className="h-10 mx-auto mb-5 object-contain"
                        />
                        <div className="inline-flex items-center justify-center px-3 py-1 mb-5 text-[11px] font-semibold tracking-widest text-[#334056] uppercase bg-[#F0F5FE] border border-[#C4D5F1] rounded-full">
                            CRM Workspace
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#0D1625] tracking-tight">
                            Create Account
                        </h1>
                        <p className="text-[#334056] text-sm mt-2">Start your workspace</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {errors.form && (
                            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm transition-all duration-300">
                                {errors.form}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="relative group">
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        disabled={submitting !== null}
                                        className="block w-full h-[44px] px-3.5 pt-4 pb-1 text-[14px] text-[#0D1625] bg-transparent border border-[#C4D5F1] rounded-[12px] appearance-none focus:outline-none focus:border-[#1E293B] focus:shadow-[0_4px_14px_rgba(0,0,0,0.05)] peer transition-all duration-300"
                                        placeholder=" "
                                        required
                                    />
                                    <label
                                        htmlFor="firstName"
                                        className="absolute left-3.5 text-[#64748B] font-normal transition-[top,color] duration-200 pointer-events-none top-1 text-[11px] peer-placeholder-shown:top-[14px] peer-placeholder-shown:text-[14px] peer-focus:top-1 peer-focus:text-[11px] peer-focus:text-[#1E293B]"
                                    >
                                        First Name
                                    </label>
                                </div>
                                {errors.firstName && (
                                    <p className="mt-1.5 text-[13px] text-red-500 ml-1">
                                        {errors.firstName}
                                    </p>
                                )}
                            </div>
                            <div>
                                <div className="relative group">
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        disabled={submitting !== null}
                                        className="block w-full h-[44px] px-3.5 pt-4 pb-1 text-[14px] text-[#0D1625] bg-transparent border border-[#C4D5F1] rounded-[12px] appearance-none focus:outline-none focus:border-[#1E293B] focus:shadow-[0_4px_14px_rgba(0,0,0,0.05)] peer transition-all duration-300"
                                        placeholder=" "
                                        required
                                    />
                                    <label
                                        htmlFor="lastName"
                                        className="absolute left-3.5 text-[#64748B] font-normal transition-[top,color] duration-200 pointer-events-none top-1 text-[11px] peer-placeholder-shown:top-[14px] peer-placeholder-shown:text-[14px] peer-focus:top-1 peer-focus:text-[11px] peer-focus:text-[#1E293B]"
                                    >
                                        Last Name
                                    </label>
                                </div>
                                {errors.lastName && (
                                    <p className="mt-1.5 text-[13px] text-red-500 ml-1">
                                        {errors.lastName}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="relative group">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
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
                            {errors.email && (
                                <p className="mt-1.5 text-[13px] text-red-500 ml-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="relative group">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
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
                                    onClick={() => setShowPassword((previous) => !previous)}
                                    className="absolute cursor-pointer right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] transition-colors focus:outline-none"
                                >
                                    {showPassword ? (
                                        <FiEyeOff className="w-4 h-4" />
                                    ) : (
                                        <FiEye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-[13px] text-red-500 ml-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="pt-2">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        name="terms"
                                        checked={agreeTerms}
                                        onChange={handleInputChange}
                                        disabled={submitting !== null}
                                        className="w-5 h-5 border-2 border-[#C4D5F1] rounded-[6px] appearance-none checked:bg-[#1E293B] checked:border-[#1E293B] transition-colors cursor-pointer"
                                    />
                                    {agreeTerms && (
                                        <svg
                                            className="absolute w-3 h-3 text-white pointer-events-none"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-[14px] text-[#334056] leading-snug group-hover:text-[#1E293B] transition-colors">
                                    I agree to the{" "}
                                    <span className="font-semibold text-[#1E293B]">Terms</span> &{" "}
                                    <span className="font-semibold text-[#1E293B]">
                                        Privacy Policy
                                    </span>
                                </span>
                            </label>
                            {errors.terms && (
                                <p className="mt-1.5 text-[13px] text-red-500 ml-1">
                                    {errors.terms}
                                </p>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting !== null}
                                className="w-full h-[44px] px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[12px] font-semibold text-[14px] transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {submitting === "email"
                                        ? "Creating account..."
                                        : "Create Account"}
                                    {submitting !== "email" && (
                                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                                            →
                                        </span>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>

                    <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#C4D5F1]"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-[#334056] text-xs font-medium uppercase tracking-wider">
                                Or
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={submitting !== null}
                        className="w-full h-[44px] px-4 bg-white border border-[#C4D5F1] shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.06)] hover:border-[#1E293B] hover:bg-[#F0F5FE]/50 text-[#0D1625] rounded-[12px] font-medium text-[14px] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        <FaGoogle className="text-lg text-[#334056] group-hover:text-[#0D1625] transition-colors" />
                        {submitting === "google" ? "Redirecting..." : "Continue with Google"}
                    </button>
                </div>

                <div className="mt-8 text-center text-[14px] text-[#334056]">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-[#1E293B] hover:text-[#0D1625] transition-colors group inline-flex items-center"
                    >
                        Sign In
                        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 ml-1">
                            →
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
