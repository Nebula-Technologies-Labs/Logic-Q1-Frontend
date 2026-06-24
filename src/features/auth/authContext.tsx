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

export type AuthContextType = {
    loading: boolean;
    authenticated: boolean;
    initialize: () => Promise<void>;
    login: (token: string) => Promise<void>;
    logout: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

let initializationPromise: Promise<boolean> | null = null;
let initializationResult: boolean | null = null;

const validateStoredSession = async (): Promise<boolean> => {
    const token = storage.getToken();

    if (!token) {
        return false;
    }

    try {
        await fetchCurrentUser();
        return true;
    } catch {
        storage.clear();
        return false;
    }
};

const runInitializeOnce = async (): Promise<boolean> => {
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

        const isAuthenticated = await runInitializeOnce();

        if (!isMountedRef.current) {
            return;
        }

        setAuthenticated(isAuthenticated);
        setLoading(false);
    }, []);

    const login = useCallback(async (token: string): Promise<void> => {
        storage.setToken(token);
        initializationResult = true;

        if (isMountedRef.current) {
            setAuthenticated(true);
            setLoading(false);
        }
    }, []);

    const logout = useCallback((): void => {
        storage.clear();
        initializationResult = false;

        if (isMountedRef.current) {
            setAuthenticated(false);
            setLoading(false);
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
            initialize,
            login,
            logout,
        }),
        [loading, authenticated, initialize, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

