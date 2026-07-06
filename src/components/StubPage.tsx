import type { LucideIcon } from "lucide-react";

interface StubPageProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

const StubPage = ({ icon: Icon, title, description }: StubPageProps) => {
    return (
        <div className="stub-page">
            <div className="stub-header">
                <h1 className="stub-title">{title}</h1>
                <p className="stub-desc">{description}</p>
            </div>

            <div className="stub-stats">
                {/* Placeholder stat cards */}
                <div className="stub-stat-card">
                    <div className="stub-stat-label">Metric 1</div>
                    <div className="stub-stat-value">—</div>
                    <div className="stub-stat-sub">No data yet</div>
                </div>
                <div className="stub-stat-card">
                    <div className="stub-stat-label">Metric 2</div>
                    <div className="stub-stat-value">—</div>
                    <div className="stub-stat-sub">No data yet</div>
                </div>
                <div className="stub-stat-card">
                    <div className="stub-stat-label">Metric 3</div>
                    <div className="stub-stat-value">—</div>
                    <div className="stub-stat-sub">No data yet</div>
                </div>
            </div>

            <div className="stub-placeholder">
                <div className="stub-icon-wrapper">
                    <Icon size={22} color="#2563EB" strokeWidth={1.8} />
                </div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#0D1625" }}>
                        {title} module coming soon
                    </div>
                    <div style={{ fontSize: 13, color: "#8899B0", marginTop: 4 }}>
                        This section is under construction.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StubPage;
