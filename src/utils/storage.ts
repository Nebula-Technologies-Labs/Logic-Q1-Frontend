const TOKEN_KEY = "token";
const LEGACY_TOKEN_KEY = "Token";

const safeGetItem = (key: string): string | null => {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
};

const safeSetItem = (key: string, value: string): void => {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // Intentionally ignore storage write failures.
    }
};

const safeRemoveItem = (key: string): void => {
    try {
        window.localStorage.removeItem(key);
    } catch {
        // Intentionally ignore storage removal failures.
    }
};

export const storage = {
    getToken(): string | null {
        return safeGetItem(TOKEN_KEY) ?? safeGetItem(LEGACY_TOKEN_KEY);
    },

    setToken(token: string): void {
        safeSetItem(TOKEN_KEY, token);

        safeRemoveItem(LEGACY_TOKEN_KEY);
    },

    clear(): void {
        safeRemoveItem(TOKEN_KEY);

        safeRemoveItem(LEGACY_TOKEN_KEY);
    },
};
