import api from "./axios";

import type {
    LoginRequest,
    LoginResponse,
} from "../types/auth.types";

export const login = async (
    payload: LoginRequest
): Promise<LoginResponse> => {

    const { data } = await api.post(
        "/auth/login",
        payload,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    return data;
};

export const logout = async (): Promise<void> => {

    await api.post(
        "/auth/logout",
        {},
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
};

export const googleLogin = (): void => {

    window.location.href =
        `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;

};