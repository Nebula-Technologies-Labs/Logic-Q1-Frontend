import {
    type ReactNode,
} from "react";

import {
    Navigate,
    useLocation,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

const RequireAuth = ({
    children,
}: {
    children: ReactNode;
}) => {
    const {
        loading,
        authenticated,
    } = useAuth();

    const location = useLocation();

    if (loading) {
        return <Spinner message="Checking session..." />;
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

    return <>{children}</>;
};

export default RequireAuth;

