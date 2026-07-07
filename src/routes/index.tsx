import { lazy, Suspense } from "react";

import { Navigate, Route, Routes } from "react-router-dom";

import { TrendingUp, Building2, BarChart2, Settings } from "lucide-react";

import ProtectedRoute from "./ProtectedRoute";
import Spinner from "@/components/ui/Spinner";
import { RootLayout } from "@/components/layout";
import StubPage from "@/components/StubPage";

import Login from "@/features/auth/pages/Login";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import Onboarding from "@/features/onboarding/pages/Onboarding";
import Contacts from "@/features/contacts/pages/Contacts";

const Register = lazy(() => import("@/features/auth/pages/Register"));
const RedirectHandler = lazy(() => import("@/features/auth/pages/RedirectHandler"));
const Dashboard = lazy(() => import("@/features/dashboard/pages/Dashboard"));

const AppRoutes = () => (
    <Suspense fallback={<Spinner message="Loading..." />}>
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/oauth2/redirect" element={<RedirectHandler />} />

            {/* Onboarding — protected, no layout shell */}
            <Route
                path="/onboarding"
                element={
                    <ProtectedRoute>
                        <Onboarding />
                    </ProtectedRoute>
                }
            />

            {/* App routes — protected, with sidebar + topbar layout */}
            <Route
                element={
                    <ProtectedRoute>
                        <RootLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route
                    path="/deals"
                    element={
                        <StubPage
                            icon={TrendingUp}
                            title="Deals"
                            description="Track and manage your sales pipeline."
                        />
                    }
                />
                <Route
                    path="/companies"
                    element={
                        <StubPage
                            icon={Building2}
                            title="Companies"
                            description="Manage your company accounts and relationships."
                        />
                    }
                />
                <Route
                    path="/reports"
                    element={
                        <StubPage
                            icon={BarChart2}
                            title="Reports"
                            description="Visualize your CRM data and performance."
                        />
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <StubPage
                            icon={Settings}
                            title="Settings"
                            description="Manage your account and workspace preferences."
                        />
                    }
                />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    </Suspense>
);

export default AppRoutes;
