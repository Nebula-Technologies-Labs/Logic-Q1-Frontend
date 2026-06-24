import axios, {
    AxiosError,
    AxiosHeaders,
    type InternalAxiosRequestConfig,
} from "axios";

import { storage } from "../utils/storage";

const PUBLIC_ROUTE_PREFIXES = [
    "/auth/login",
    "/auth/register",
    "/oauth2",
];

let unauthorizedBroadcastInFlight = false;

const resolveBaseUrl = (): string =>
    import.meta.env.VITE_API_URL ??
    import.meta.env.VITE_API_BASE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost");

const normalizePath = (url: string): string => {
    try {
        return new URL(url, resolveBaseUrl()).pathname;
    } catch {
        return url.split("?")[0].split("#")[0];
    }
};

const isPublicRoute = (url: string): boolean =>
    PUBLIC_ROUTE_PREFIXES.some((prefix) => normalizePath(url).startsWith(prefix));

const api = axios.create({
    baseURL: resolveBaseUrl(),
    withCredentials: true,
    timeout: 10000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    const headers = AxiosHeaders.from(config.headers);

    if (token && !isPublicRoute(config.url ?? "")) {
        headers.set("Authorization", `Bearer ${token}`);
    } else {
        headers.delete("Authorization");
    }

    config.headers = headers;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401 && !unauthorizedBroadcastInFlight) {
            unauthorizedBroadcastInFlight = true;
            storage.clear();
            window.dispatchEvent(new Event("unauthorized"));

            window.setTimeout(() => {
                unauthorizedBroadcastInFlight = false;
            }, 0);
        }

        return Promise.reject(error);
    }
);

export default api;

