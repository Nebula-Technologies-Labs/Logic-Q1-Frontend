import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { fetchCurrentUser } from "./api/auth.service";
import { storage } from "../../utils/storage";
import type { AuthUser } from "./types/auth.types";

export type AuthContextType = {
    loading: boolean;
    authenticated: boolean;
    user: AuthUser | null;
    initialize: () => Promise<void>;
    login: (token: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

let initializationPromise: Promise<{ authenticated: boolean; user: AuthUser | null }> | null = null;
let initializationResult: { authenticated: boolean; user: AuthUser | null } | null = null;

const validateStoredSession = async (): Promise<{ authenticated: boolean; user: AuthUser | null }> => {
    const token = storage.getToken();

    if (!token) {
        return { authenticated: false, user: null };
    }

    try {
        const response = await fetchCurrentUser();
        return { authenticated: true, user: response.user };
    } catch {
        storage.clear();
        return { authenticated: false, user: null };
    }
};

const runInitializeOnce = async (): Promise<{ authenticated: boolean; user: AuthUser | null }> => {
    if (initializationResult !== null) {
        return initializationResult;
    }

    if (!initializationPromise) {
        initializationPromise = validateStoredSession()
            .then((result) => {
                initializationResult = result;
                return result;
            })
            .finally(() => {
                initializationPromise = null;
            });
    }

    return initializationPromise;
};

export const AuthProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const initialize = useCallback(async (): Promise<void> => {
        if (isMountedRef.current) {
            setLoading(true);
        }

        const result = await runInitializeOnce();

        if (!isMountedRef.current) {
            return;
        }

        setAuthenticated(result.authenticated);
        setUser(result.user);
        setLoading(false);
    }, []);

    const login = useCallback(async (token: string): Promise<void> => {
        storage.setToken(token);

        try {
            const response = await fetchCurrentUser();
            initializationResult = { authenticated: true, user: response.user };

            if (isMountedRef.current) {
                setAuthenticated(true);
                setUser(response.user);
                setLoading(false);
            }
        } catch {
            initializationResult = { authenticated: true, user: null };

            if (isMountedRef.current) {
                setAuthenticated(true);
                setUser(null);
                setLoading(false);
            }
        }
    }, []);

    const logout = useCallback((): void => {
        storage.clear();
        initializationResult = null;

        if (isMountedRef.current) {
            setAuthenticated(false);
            setUser(null);
            setLoading(false);
        }
    }, []);

    const refreshUser = useCallback(async (): Promise<void> => {
        try {
            const response = await fetchCurrentUser();
            initializationResult = { authenticated: true, user: response.user };

            if (isMountedRef.current) {
                setUser(response.user);
            }
        } catch {
            // If refresh fails, don't change auth state — just leave user as-is
        }
    }, []);

    useEffect(() => {
        void initialize();
    }, [initialize]);

    useEffect(() => {
        const handleUnauthorized = () => {
            logout();
        };

        window.addEventListener("unauthorized", handleUnauthorized);
        return () => {
            window.removeEventListener("unauthorized", handleUnauthorized);
        };
    }, [logout]);

    const value = useMemo(
        () => ({
            loading,
            authenticated,
            user,
            initialize,
            login,
            logout,
            refreshUser,
        }),
        [loading, authenticated, user, initialize, login, logout, refreshUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
