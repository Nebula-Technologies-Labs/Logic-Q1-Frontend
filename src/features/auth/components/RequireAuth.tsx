import { type ReactNode } from "react";

import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

const RequireAuth = ({ children }: { children: ReactNode }) => {
    const { loading, authenticated, user } = useAuth();

    const location = useLocation();

    if (loading) {
        return <Spinner message="Checking session..." />;
    }

    if (!authenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Redirect to onboarding if org hasn't been created yet
    if (user && !user.orgId && location.pathname !== "/onboarding") {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};

export default RequireAuth;
