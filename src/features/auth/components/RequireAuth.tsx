import {
    type ReactNode,
} from "react";

import {
    Navigate,
    useLocation,
} from "react-router-dom";

import {
    useAuth,
} from "../hooks/useAuth";

const RequireAuth = ({
    children,
}: {
    children: ReactNode;
}) => {
    const {
        loading,
        authenticated,
        user,
    } = useAuth();

    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
                <div className="text-center space-y-3">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                    <p>Checking session...</p>
                </div>
            </div>
        );
    }

    if (!authenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // Redirect to onboarding if org hasn't been created yet
    if (user && !user.orgId && location.pathname !== "/onboarding") {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};

export default RequireAuth;
