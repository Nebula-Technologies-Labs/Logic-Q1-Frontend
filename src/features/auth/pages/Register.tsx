import {
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";

import {
    FaGoogle,
    FaEye,
    FaEyeSlash,
} from "react-icons/fa";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../hooks";

import {
    register as registerAccount,
    startGoogleOAuth,
} from "../api/auth.service";

import {
    validateRegister,
    type RegistrationForm,
} from "../validators/register.validator";

const Register = () => {

    const navigate =
        useNavigate();

    const {
        login,
    } = useAuth();

    const [
        formData,
        setFormData,
    ] = useState<RegistrationForm>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    const [
        agreeTerms,
        setAgreeTerms,
    ] = useState(false);

    const [
        showPassword,
        setShowPassword,
    ] = useState(false);

    const [
        submitting,
        setSubmitting,
    ] = useState<
        "email" | "google" | null
    >(null);

    const [
        errors,
        setErrors,
    ] = useState<
        Record<string, string>
    >({});

    const validateForm =
        (): boolean => {

            const nextErrors =
                validateRegister(
                    formData,
                    agreeTerms,
                );

            setErrors(
                nextErrors
            );

            return (
                Object.keys(
                    nextErrors
                ).length === 0
            );

        };

    const handleInputChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {

        const {
            name,
            value,
            checked,
        } = event.target;

        if (
            name === "terms"
        ) {

            setAgreeTerms(
                checked
            );

            setErrors(
                previous => {

                    const next = {
                        ...previous,
                    };

                    delete next.terms;

                    return next;

                }
            );

            return;

        }

        setFormData(
            previous => ({
                ...previous,
                [name]: value,
            })
        );

        if (
            errors[name]
        ) {

            setErrors(
                previous => ({
                    ...previous,
                    [name]: "",
                })
            );

        }

    };

    const handleRegister =
        async (
            event: FormEvent<HTMLFormElement>,
        ) => {

            event.preventDefault();

            if (
                !validateForm()
            ) {

                return;

            }

            setSubmitting(
                "email"
            );

            setErrors(
                {}
            );

            try {

                const {
                    token,
                } =
                    await registerAccount(
                        {
                            firstName:
                                formData.firstName.trim(),
                            lastName:
                                formData.lastName.trim(),

                            email:
                                formData.email.trim(),

                            password:
                                formData.password,
                        }
                    );

                if (
                    !token
                ) {

                    throw new Error(
                        "Registration succeeded but no token was returned.",
                    );

                }

                await login(
                    token
                );

                navigate(
                    "/dashboard",
                    {
                        replace: true,
                    }
                );

            } catch (
                cause
                ) {

                const message =
                    cause instanceof Error
                        ? cause.message
                        : "Registration failed. Please try again.";

                setErrors(
                    previous => ({
                        ...previous,
                        form: message,
                    })
                );

            } finally {

                setSubmitting(
                    null
                );

            }

        };

    const handleGoogleAuth =
        () => {

            setSubmitting(
                "google"
            );

            startGoogleOAuth();

        };

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">

            <div className="bg-white shadow-2xl rounded-3xl p-10 border border-gray-100 w-full max-w-md">

                <div className="text-center mb-10">

                    <img
                        src="/assets/logo.png"
                        alt="LogicQ1"
                        className="h-20 mx-auto mb-5"
                    />

                    <h1 className="text-3xl font-bold text-gray-900">

                        Create Account

                    </h1>

                    <p className="text-gray-500 mt-2">

                        Start your workspace

                    </p>

                </div>

                <button

                    type="button"

                    onClick={
                        handleGoogleAuth
                    }

                    disabled={
                        submitting !== null
                    }

                    className="w-full py-3 border border-gray-300 rounded-xl flex items-center justify-center gap-3 font-medium hover:bg-gray-50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"                >

                    <FaGoogle />

                    {submitting === "google"

                        ? "Redirecting..."

                        : "Continue with Google"}

                </button>

                <div className="my-8 flex items-center gap-4">

                    <div className="h-px flex-1 bg-slate-200" />

                    <span className="text-sm text-slate-400">

                        OR

                    </span>

                    <div className="h-px flex-1 bg-slate-200" />

                </div>

                <form
                    onSubmit={
                        handleRegister
                    }
                    className="space-y-5"
                >

                    {errors.form && (

                        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">

                            {errors.form}

                        </div>

                    )}

                    <div className="grid grid-cols-2 gap-4">

                        <div>

                            <input

                                type="text"

                                name="firstName"

                                placeholder="First Name"

                                value={formData.firstName}

                                onChange={handleInputChange}

                                className="h-14 w-full rounded-2xl border border-slate-300 px-5"

                            />

                            {errors.firstName && (

                                <p className="mt-1 text-xs text-red-600">

                                    {errors.firstName}

                                </p>

                            )}

                        </div>

                        <div>

                            <input

                                type="text"

                                name="lastName"

                                placeholder="Last Name"

                                value={formData.lastName}

                                onChange={handleInputChange}

                                className="h-14 w-full rounded-2xl border border-slate-300 px-5"

                            />

                            {errors.lastName && (

                                <p className="mt-1 text-xs text-red-600">

                                    {errors.lastName}

                                </p>

                            )}

                        </div>

                    </div>

                    <input

                        type="email"

                        name="email"

                        placeholder="Email"

                        value={
                            formData.email
                        }

                        onChange={
                            handleInputChange
                        }

                        className="h-14 w-full rounded-2xl border border-slate-300 px-5"

                    />

                    {errors.email && (

                        <p className="text-xs text-red-600">

                            {errors.email}

                        </p>

                    )}

                    <div className="relative">

                        <input

                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }

                            name="password"

                            placeholder="Password"

                            value={
                                formData.password
                            }

                            onChange={
                                handleInputChange
                            }

                            className="h-14 w-full rounded-2xl border border-slate-300 px-5 pr-14"

                        />

                        <button

                            type="button"

                            onClick={
                                () =>
                                    setShowPassword(
                                        previous =>
                                            !previous
                                    )
                            }

                            className="absolute right-5 top-1/2 -translate-y-1/2"

                        >

                            {showPassword

                                ? <FaEyeSlash />

                                : <FaEye />}

                        </button>

                    </div>

                    {errors.password && (

                        <p className="text-xs text-red-600">

                            {errors.password}

                        </p>

                    )}

                    <label className="flex gap-3 text-sm text-slate-500">

                        <input

                            type="checkbox"

                            name="terms"

                            checked={
                                agreeTerms
                            }

                            onChange={
                                handleInputChange
                            }

                        />

                        <span>

                            I agree to the Terms & Privacy Policy

                        </span>

                    </label>

                    {errors.terms && (

                        <p className="text-xs text-red-600">

                            {errors.terms}

                        </p>

                    )}

                    <button

                        type="submit"

                        disabled={
                            submitting !== null
                        }

                        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"

                    >

                        {submitting === "email"

                            ? "Creating account..."

                            : "Create Account"}

                    </button>

                </form>

                <div className="mt-8 text-center text-slate-500">

                    Already have an account?

                    <Link

                        to="/login"

                        className="ml-2 font-semibold text-blue-600"

                    >

                        Sign In

                    </Link>

                </div>

            </div>

        </div>

    );

};

export default Register;