import api from "../../../lib/axios";
import { env } from "../../../config/env";

import type {
    LoginRequest,
    AuthResponse,
    RegisterRequest,
} from "../types/auth.types";

const GOOGLE_OAUTH_FALLBACK_PATH = "/oauth2/authorization/google";

export const emailLogin = async (
    payload: LoginRequest
): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(
        "/auth/login",
        payload
    );

    return data;
};

export const register = async (
    payload: RegisterRequest
): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(
        "/auth/register",
        payload
    );

    return data;
};

export const fetchCurrentUser = async (): Promise<AuthResponse> => {
    const { data } = await api.get<AuthResponse>("/auth/me");
    return data;
};

export interface ForgotPasswordResponse {
    status: boolean;
    message: string;
    token?: string;
}

export const sendPasswordResetOTP = async (
    email: string,
): Promise<ForgotPasswordResponse> => {
    const { data } = await api.post<ForgotPasswordResponse>(
        `/auth/forgotPassword/verifyMail/${encodeURIComponent(email)}`,
    );
    return data;
};

export const verifyPasswordResetOTP = async (
    email: string,
    otp: string,
): Promise<ForgotPasswordResponse> => {
    const { data } = await api.post<ForgotPasswordResponse>(
        `/auth/forgotPassword/verifyOTP/${encodeURIComponent(email)}/${encodeURIComponent(otp)}`,
    );
    return data;
};

export const changePassword = async (
    email: string,
    password: string,
    repeatPassword: string,
    token: string,
): Promise<ForgotPasswordResponse> => {
    const { data } = await api.post<ForgotPasswordResponse>(
        `/auth/forgotPassword/changePassword/${encodeURIComponent(email)}`,
        { password, repeatPassword },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data;
};

export const resolveGoogleLoginUrl = (): string => {
    const configuredUrl = env.googleLoginUrl?.trim();

    if (configuredUrl) {
        return configuredUrl;
    }

    const apiBaseUrl = env.apiUrl?.trim();

    if (apiBaseUrl) {
        return new URL(GOOGLE_OAUTH_FALLBACK_PATH, apiBaseUrl).toString();
    }

    return GOOGLE_OAUTH_FALLBACK_PATH;
};

export const completeGoogleOAuth = async (): Promise<AuthResponse> => {
    const { data } = await api.get<AuthResponse>(
        "/auth/oauth/success"
    );

    return data;
};

export const startGoogleOAuth = (): void => {
    window.location.assign(resolveGoogleLoginUrl());
};
