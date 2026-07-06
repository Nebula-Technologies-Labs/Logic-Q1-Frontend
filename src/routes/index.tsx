import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import OAuthRedirect from "../features/auth/pages/OAuthRedirect.tsx";


const AppRoutes = () => (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
            path="/oauth2/redirect"
            element={<OAuthRedirect />}
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
);

export default AppRoutes;

