import { useState } from "react";

import {
    login,
    googleLogin,
} from "../api/auth.api";

import { storage } from "../utils/storage";

import { useNavigate } from "react-router-dom";

export const useAuth = () => {
    const navigate = useNavigate();

    const [loading, setLoading] =
        useState<string | null>(null);

    const [error, setError] =
        useState("");

    const emailLogin = async (
        email: string,
        password: string
    ) => {
        try {
            setError("");

            if (!email.trim()) {
                throw new Error("Email is required");
            }

            if (!password.trim()) {
                throw new Error("Password is required");
            }

            const regex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!regex.test(email)) {
                throw new Error("Invalid email");
            }

            setLoading("email");

            const response = await login({
                email,
                password,
            });

            storage.setToken(
                response.token
            );

            navigate("/dashboard");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Login failed"
            );
        } finally {
            setLoading(null);
        }
    };

    const oauthLogin = () => {
        setLoading("google");

        googleLogin();
    };

    return {
        loading,

        error,

        emailLogin,

        oauthLogin,
    };
};