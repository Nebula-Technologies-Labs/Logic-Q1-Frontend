import React from "react";

type HandleEmailLoginProps = {
    e: React.FormEvent<HTMLFormElement>;
    email: string;
    password: string;
    setEmailError: (value: string) => void;
    setIsLoading: (value: string | null) => void;
};

export const handleEmailLogin = ({
                                     e,
                                     email,
                                     password,
                                     setEmailError,
                                     setIsLoading,
                                 }: HandleEmailLoginProps) => {
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

    console.log("Email login attempt:", {
        email,
        password,
    });

    // TODO: call backend API

    setIsLoading(null);
};

export const handleGoogleAuth = (
    setIsLoading: (value: string | null) => void
) => {
    setIsLoading("google");

    window.location.href =
        `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
};