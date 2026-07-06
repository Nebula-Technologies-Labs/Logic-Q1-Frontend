import { LayoutDashboard } from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth";

const Dashboard = () => {
    const { user } = useAuth();
    const greeting = user?.firstName ? `Welcome back, ${user.firstName}` : "Welcome back";

    return (
        <div className="stub-page">
            <div className="stub-header">
                <h1 className="stub-title">{greeting}</h1>
                <p className="stub-desc">Here is what's happening with your workspace today.</p>
            </div>

            <div className="stub-stats">
                <div className="stub-stat-card">
                    <div className="stub-stat-label">Total Contacts</div>
                    <div className="stub-stat-value">0</div>
                    <div className="stub-stat-sub">Manage your network</div>
                </div>
                <div className="stub-stat-card">
                    <div className="stub-stat-label">Active Deals</div>
                    <div className="stub-stat-value">0</div>
                    <div className="stub-stat-sub">Track your pipeline</div>
                </div>
                <div className="stub-stat-card">
                    <div className="stub-stat-label">Tasks Due</div>
                    <div className="stub-stat-value">0</div>
                    <div className="stub-stat-sub">Stay on top of your work</div>
                </div>
            </div>

            <div className="stub-placeholder">
                <div className="stub-icon-wrapper">
                    <LayoutDashboard size={22} color="#2563EB" strokeWidth={1.8} />
                </div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#0D1625" }}>
                        Dashboard coming soon
                    </div>
                    <div style={{ fontSize: 13, color: "#8899B0", marginTop: 4 }}>
                        This section is under construction.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
