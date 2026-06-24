import api from "../../../lib/axios";
import { env } from "../../../config/env";

import type {
    LoginRequest,
    AuthResponse,
    RegisterRequest,
    AuthUser,
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

export const fetchCurrentUser = async (): Promise<AuthUser> => {
    const { data } = await api.get<AuthUser>("/auth/me");
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
