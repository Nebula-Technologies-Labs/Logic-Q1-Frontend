import {
    useState,
} from "react";

import {
    useAuth,
} from "../../auth/hooks/useAuth";

const Dashboard = () => {
    const { logout } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const handleLogout = () => {
        setSubmitting(true);
        logout();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
            <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Logiq1 Dashboard</h1>
                        <p className="mt-1 text-sm text-slate-500">You are signed in through the centralized auth context.</p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={submitting}
                        className="rounded-xl bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Signing out..." : "Logout"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

