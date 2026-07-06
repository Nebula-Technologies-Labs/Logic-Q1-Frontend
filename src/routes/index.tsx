import { lazy, Suspense } from "react";

import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import Login from "@/features/auth/pages/Login";
import Spinner from "@/components/ui/Spinner";

const Register = lazy(() => import("@/features/auth/pages/Register"));
const RedirectHandler = lazy(() => import("@/features/auth/pages/RedirectHandler"));
const Dashboard = lazy(() => import("@/features/dashboard/pages/Dashboard"));

const AppRoutes = () => (
    <Suspense fallback={<Spinner message="Loading..." />}>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/oauth2/redirect"
                element={<RedirectHandler />}
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    </Suspense>
);

export default AppRoutes;

