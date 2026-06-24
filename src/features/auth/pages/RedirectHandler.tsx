import {
    useEffect,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../hooks/useAuth";

let lastHandledRedirectUrl: string | null = null;

const readTokenFromRedirect = (): string | null => {
    const queryParams = new URLSearchParams(window.location.search);
    const hashParams = window.location.hash
        ? new URLSearchParams(window.location.hash.replace(/^#/, ""))
        : null;

    return (
        queryParams.get("token") ??
        queryParams.get("access_token") ??
        queryParams.get("accessToken") ??
        hashParams?.get("token") ??
        hashParams?.get("access_token") ??
        hashParams?.get("accessToken") ??
        null
    );
};

const RedirectHandler = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const currentUrl = window.location.href;

        if (lastHandledRedirectUrl === currentUrl) {
            return;
        }

        lastHandledRedirectUrl = currentUrl;

        let cancelled = false;

        const run = async () => {
            const token = readTokenFromRedirect();

            if (token) {
                await login(token);

                if (!cancelled) {
                    navigate("/dashboard", { replace: true });
                }

                return;
            }

            if (!cancelled) {
                navigate("/login", { replace: true });
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, [login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
            <div className="text-center space-y-3">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                <p>Completing sign-in...</p>
            </div>
        </div>
    );
};

export default RedirectHandler;

