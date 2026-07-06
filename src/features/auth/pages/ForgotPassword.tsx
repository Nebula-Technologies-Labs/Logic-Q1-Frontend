import {
    useState,
    useRef,
    useEffect,
    type FormEvent,
    type KeyboardEvent,
    type ClipboardEvent,
} from "react";
import { isAxiosError } from "axios";

import {
    FiEye,
    FiEyeOff,
    FiArrowLeft,
    FiMail,
    FiShield,
    FiLock,
    FiCheck,
} from "react-icons/fi";

import { Link, useNavigate } from "react-router-dom";

import {
    sendPasswordResetOTP,
    verifyPasswordResetOTP,
    changePassword,
} from "../api/auth.service";

type Step = "email" | "otp" | "password" | "success";

const OTP_LENGTH = 6;

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [resetToken, setResetToken] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const extractErrorMessage = (cause: unknown, fallback: string): string => {
        if (isAxiosError(cause) && cause.response?.data?.message) {
            return cause.response.data.message;
        }
        if (cause instanceof Error) {
            return cause.message;
        }
        return fallback;
    };

    // ── Step 1: Send OTP ──────────────────────────────────────────────
    const handleSendOTP = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setError("Email is required");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setError("Please enter a valid email address");
            return;
        }

        setSubmitting(true);
        try {
            const response = await sendPasswordResetOTP(trimmedEmail);
            if (response.status === false) {
                setError(response.message || "Failed to send OTP. Please try again.");
                return;
            }
            setSuccessMessage(response.message || "OTP sent to your email");
            setStep("otp");
            setResendCooldown(60);
            // Auto-focus first OTP input after step transition
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (cause) {
            setError(extractErrorMessage(cause, "Failed to send OTP. Please try again."));
        } finally {
            setSubmitting(false);
        }
    };

    // ── Resend OTP ────────────────────────────────────────────────────
    const handleResendOTP = async () => {
        if (resendCooldown > 0) return;
        setError(null);
        setSuccessMessage(null);
        setSubmitting(true);
        try {
            const response = await sendPasswordResetOTP(email.trim());
            if (response.status === false) {
                setError(response.message || "Failed to resend OTP.");
                return;
            }
            setSuccessMessage(response.message || "OTP resent to your email");
            setOtp(Array(OTP_LENGTH).fill(""));
            setResendCooldown(60);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (cause) {
            setError(extractErrorMessage(cause, "Failed to resend OTP."));
        } finally {
            setSubmitting(false);
        }
    };

    // ── OTP Input Handlers ────────────────────────────────────────────
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const digit = value.slice(-1);
        const next = [...otp];
        next[index] = digit;
        setOtp(next);
        if (digit && index < OTP_LENGTH - 1) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;
        const next = [...otp];
        for (let i = 0; i < pasted.length; i++) {
            next[i] = pasted[i];
        }
        setOtp(next);
        const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
        otpRefs.current[focusIndex]?.focus();
    };

    // ── Step 2: Verify OTP ────────────────────────────────────────────
    const handleVerifyOTP = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const otpValue = otp.join("");
        if (otpValue.length !== OTP_LENGTH) {
            setError(`Please enter the complete ${OTP_LENGTH}-digit OTP`);
            return;
        }

        setSubmitting(true);
        try {
            const response = await verifyPasswordResetOTP(email.trim(), otpValue);
            if (response.status === false) {
                setError(response.message || "Invalid OTP. Please try again.");
                return;
            }
            if (response.token) {
                setResetToken(response.token);
            }
            setSuccessMessage(response.message || "OTP verified successfully");
            setStep("password");
        } catch (cause) {
            setError(extractErrorMessage(cause, "Invalid OTP. Please try again."));
        } finally {
            setSubmitting(false);
        }
    };

    // ── Step 3: Change Password ───────────────────────────────────────
    const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        // Validation
        if (!password) {
            setError("Password is required");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }
        if (!/[A-Z]/.test(password)) {
            setError("Password must include at least one uppercase letter");
            return;
        }
        if (!/[a-z]/.test(password)) {
            setError("Password must include at least one lowercase letter");
            return;
        }
        if (!/[0-9]/.test(password)) {
            setError("Password must include at least one number");
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setError("Password must include at least one special character");
            return;
        }
        if (password !== repeatPassword) {
            setError("Passwords do not match");
            return;
        }

        setSubmitting(true);
        try {
            const response = await changePassword(email.trim(), password, repeatPassword, resetToken);
            if (response.status === false) {
                setError(response.message || "Failed to update password. Please try again.");
                return;
            }
            setStep("success");
        } catch (cause) {
            setError(extractErrorMessage(cause, "Failed to update password. Please try again."));
        } finally {
            setSubmitting(false);
        }
    };

    // ── Step Indicator ────────────────────────────────────────────────
    const stepConfig = {
        email: { number: 1, title: "Reset Password", subtitle: "Enter your email to receive a verification code" },
        otp: { number: 2, title: "Verify OTP", subtitle: `Enter the ${OTP_LENGTH}-digit code sent to ${email}` },
        password: { number: 3, title: "New Password", subtitle: "Create a strong password for your account" },
        success: { number: 3, title: "Password Updated", subtitle: "Your password has been changed successfully" },
    };

    const currentStep = stepConfig[step];

    const stepIcons = [
        { key: "email", icon: FiMail, label: "Email" },
        { key: "otp", icon: FiShield, label: "Verify" },
        { key: "password", icon: FiLock, label: "Reset" },
    ];

    const getStepState = (stepKey: string) => {
        const order = ["email", "otp", "password", "success"];
        const current = order.indexOf(step);
        const target = order.indexOf(stepKey);
        if (target < current || step === "success") return "completed";
        if (target === current) return "active";
        return "pending";
    };

    return (
        <div className="min-h-screen bg-[#F0F5FE] relative overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sans text-[#0D1625]">
            {/* Background effects */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/60 via-[#F0F5FE] to-[#F0F5FE]"></div>
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/50 to-transparent z-0 pointer-events-none"></div>

            <div className="w-full max-w-[440px] z-10 py-4">
                <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 border border-[#C4D5F1] transition-all duration-300">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <img src="/assets/logo.png" alt="LogicQ1" className="h-10 mx-auto mb-5 object-contain" />
                        <div className="inline-flex items-center justify-center px-3 py-1 mb-5 text-[11px] font-semibold tracking-widest text-[#334056] uppercase bg-[#F0F5FE] border border-[#C4D5F1] rounded-full">
                            CRM Workspace
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#0D1625] tracking-tight">{currentStep.title}</h1>
                        <p className="text-[#334056] text-sm mt-2">{currentStep.subtitle}</p>
                    </div>

                    {/* Step Progress */}
                    {step !== "success" && (
                        <div className="flex items-center justify-center gap-2 mb-8">
                            {stepIcons.map((s, i) => {
                                const state = getStepState(s.key);
                                const Icon = s.icon;
                                return (
                                    <div key={s.key} className="flex items-center gap-2">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                state === "completed"
                                                    ? "bg-green-500 text-white"
                                                    : state === "active"
                                                    ? "bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.3)]"
                                                    : "bg-[#F0F5FE] text-[#64748B] border border-[#C4D5F1]"
                                            }`}
                                        >
                                            {state === "completed" ? <FiCheck className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                                        </div>
                                        {i < stepIcons.length - 1 && (
                                            <div
                                                className={`w-8 h-[2px] rounded-full transition-all duration-300 ${
                                                    state === "completed" ? "bg-green-500" : "bg-[#C4D5F1]"
                                                }`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Error & Success Messages */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm mb-4 transition-all duration-300">
                            {error}
                        </div>
                    )}
                    {successMessage && step !== "success" && (
                        <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl p-3 text-sm mb-4 transition-all duration-300">
                            {successMessage}
                        </div>
                    )}

                    {/* ── Step 1: Email ─────────────────────────────────────── */}
                    {step === "email" && (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div className="relative group">
                                <input
                                    id="forgot-email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={submitting}
                                    className="block w-full h-[44px] px-3.5 pt-4 pb-1 text-[14px] text-[#0D1625] bg-transparent border border-[#C4D5F1] rounded-[12px] appearance-none focus:outline-none focus:border-[#1E293B] focus:shadow-[0_4px_14px_rgba(0,0,0,0.05)] peer transition-all duration-300"
                                    placeholder=" "
                                    required
                                />
                                <label
                                    htmlFor="forgot-email"
                                    className="absolute left-3.5 text-[#64748B] font-normal transition-[top,color] duration-200 pointer-events-none top-1 text-[11px] peer-placeholder-shown:top-[14px] peer-placeholder-shown:text-[14px] peer-focus:top-1 peer-focus:text-[11px] peer-focus:text-[#1E293B]"
                                >
                                    Email Address
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-[44px] px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[12px] font-semibold text-[14px] transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {submitting ? "Sending OTP..." : "Send Verification Code"}
                                    {!submitting && (
                                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                                    )}
                                </span>
                            </button>
                        </form>
                    )}

                    {/* ── Step 2: OTP ───────────────────────────────────────── */}
                    {step === "otp" && (
                        <form onSubmit={handleVerifyOTP} className="space-y-5">
                            <div>
                                <div className="flex justify-center gap-2.5">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { otpRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            onPaste={index === 0 ? handleOtpPaste : undefined}
                                            disabled={submitting}
                                            className={`w-11 h-12 text-center text-lg font-semibold text-[#0D1625] border rounded-[12px] transition-all duration-200 focus:outline-none focus:border-[#1E293B] focus:shadow-[0_4px_14px_rgba(0,0,0,0.05)] disabled:opacity-60 ${
                                                digit ? "border-[#1E293B] bg-[#F0F5FE]/60" : "border-[#C4D5F1] bg-transparent"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-center mt-4">
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={resendCooldown > 0 || submitting}
                                        className="text-[13px] font-medium text-[#334056] hover:text-[#1E293B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resendCooldown > 0
                                            ? `Resend OTP in ${resendCooldown}s`
                                            : "Resend OTP"}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || otp.join("").length !== OTP_LENGTH}
                                className="w-full h-[44px] px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[12px] font-semibold text-[14px] transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {submitting ? "Verifying..." : "Verify OTP"}
                                    {!submitting && (
                                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                                    )}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => { setStep("email"); setError(null); setSuccessMessage(null); }}
                                className="w-full flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#334056] hover:text-[#1E293B] transition-colors"
                            >
                                <FiArrowLeft className="w-3.5 h-3.5" />
                                Change email address
                            </button>
                        </form>
                    )}

                    {/* ── Step 3: New Password ─────────────────────────────── */}
                    {step === "password" && (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="relative group">
                                <input
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={submitting}
                                    className="block w-full h-[44px] pl-3.5 pr-10 pt-4 pb-1 text-[14px] text-[#0D1625] bg-transparent border border-[#C4D5F1] rounded-[12px] appearance-none focus:outline-none focus:border-[#1E293B] focus:shadow-[0_4px_14px_rgba(0,0,0,0.05)] peer transition-all duration-300"
                                    placeholder=" "
                                    required
                                />
                                <label
                                    htmlFor="new-password"
                                    className="absolute left-3.5 text-[#64748B] font-normal transition-[top,color] duration-200 pointer-events-none top-1 text-[11px] peer-placeholder-shown:top-[14px] peer-placeholder-shown:text-[14px] peer-focus:top-1 peer-focus:text-[11px] peer-focus:text-[#1E293B]"
                                >
                                    New Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute cursor-pointer right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] transition-colors focus:outline-none"
                                >
                                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="relative group">
                                <input
                                    id="repeat-password"
                                    type={showRepeatPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={repeatPassword}
                                    onChange={(e) => setRepeatPassword(e.target.value)}
                                    disabled={submitting}
                                    className="block w-full h-[44px] pl-3.5 pr-10 pt-4 pb-1 text-[14px] text-[#0D1625] bg-transparent border border-[#C4D5F1] rounded-[12px] appearance-none focus:outline-none focus:border-[#1E293B] focus:shadow-[0_4px_14px_rgba(0,0,0,0.05)] peer transition-all duration-300"
                                    placeholder=" "
                                    required
                                />
                                <label
                                    htmlFor="repeat-password"
                                    className="absolute left-3.5 text-[#64748B] font-normal transition-[top,color] duration-200 pointer-events-none top-1 text-[11px] peer-placeholder-shown:top-[14px] peer-placeholder-shown:text-[14px] peer-focus:top-1 peer-focus:text-[11px] peer-focus:text-[#1E293B]"
                                >
                                    Confirm Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowRepeatPassword((prev) => !prev)}
                                    className="absolute cursor-pointer right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] transition-colors focus:outline-none"
                                >
                                    {showRepeatPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Password strength hints */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-1">
                                {[
                                    { label: "8+ characters", test: password.length >= 8 },
                                    { label: "Uppercase", test: /[A-Z]/.test(password) },
                                    { label: "Lowercase", test: /[a-z]/.test(password) },
                                    { label: "Number", test: /[0-9]/.test(password) },
                                    { label: "Special char", test: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
                                    { label: "Passwords match", test: password.length > 0 && password === repeatPassword },
                                ].map((rule) => (
                                    <div
                                        key={rule.label}
                                        className={`flex items-center gap-1.5 text-[12px] transition-colors duration-200 ${
                                            rule.test ? "text-green-600" : "text-[#94A3B8]"
                                        }`}
                                    >
                                        <div
                                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-200 ${
                                                rule.test
                                                    ? "bg-green-500 text-white"
                                                    : "border border-[#C4D5F1]"
                                            }`}
                                        >
                                            {rule.test && <FiCheck className="w-2 h-2" />}
                                        </div>
                                        {rule.label}
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-[44px] px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[12px] font-semibold text-[14px] transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {submitting ? "Updating Password..." : "Update Password"}
                                    {!submitting && (
                                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                                    )}
                                </span>
                            </button>
                        </form>
                    )}

                    {/* ── Step 4: Success ───────────────────────────────────── */}
                    {step === "success" && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                                <FiCheck className="w-7 h-7 text-green-500" />
                            </div>
                            <p className="text-[#334056] text-sm">
                                Your password has been updated. You can now sign in with your new credentials.
                            </p>
                            <button
                                type="button"
                                onClick={() => navigate("/login", { replace: true })}
                                className="w-full h-[44px] px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[12px] font-semibold text-[14px] transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] active:translate-y-0 active:shadow-none group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Go to Sign In
                                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer link */}
                <div className="mt-8 text-center text-[14px] text-[#334056]">
                    Remember your password?{" "}
                    <Link to="/login" className="font-semibold text-[#1E293B] hover:text-[#0D1625] transition-colors group inline-flex items-center">
                        Sign In
                        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 ml-1">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
