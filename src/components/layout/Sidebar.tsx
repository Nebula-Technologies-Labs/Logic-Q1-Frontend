import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    TrendingUp,
    Building2,
    BarChart2,
    Settings,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const NAV_ITEMS = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/contacts", label: "Contacts", icon: Users },
    { path: "/deals", label: "Deals", icon: TrendingUp },
    { path: "/companies", label: "Companies", icon: Building2 },
    { path: "/reports", label: "Reports", icon: BarChart2 },
];

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
    return (
        <aside className={`sidebar ${collapsed ? "collapsed" : "expanded"}`}>
            {/* Logo and Collapse Toggle */}
            <div className="sidebar-header">
                <div className="sidebar-logo-icon">
                    <span
                        style={{
                            color: "#fff",
                            fontSize: 14,
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        L
                    </span>
                </div>
                {!collapsed && (
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                fontSize: 14.5,
                                fontWeight: 700,
                                color: "#fff",
                                letterSpacing: "-0.015em",
                                whiteSpace: "nowrap",
                            }}
                        >
                            LOGIQ1
                        </div>
                        <div style={{ fontSize: 10.5, color: "#94A3B8", whiteSpace: "nowrap" }}>
                            CRM Workspace
                        </div>
                    </div>
                )}
                <button
                    onClick={onToggle}
                    className="sidebar-toggle-btn"
                    style={{ marginLeft: collapsed ? 0 : "auto" }}
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
                </button>
            </div>

            {/* Main nav */}
            <div className="sidebar-nav-container">
                {!collapsed && (
                    <div
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "#94A3B8",
                            opacity: 0.45,
                            padding: "6px 11px 6px",
                            marginBottom: 2,
                        }}
                    >
                        Menu
                    </div>
                )}
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon size={16} strokeWidth={1.8} />
                            {!collapsed && (
                                <span
                                    style={{
                                        fontSize: 13.5,
                                        fontWeight: 400,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {item.label}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </div>

            {/* Settings */}
            <div className="sidebar-bottom">
                <NavLink
                    to="/settings"
                    className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                    title={collapsed ? "Settings" : undefined}
                >
                    <Settings size={16} strokeWidth={1.8} />
                    {!collapsed && (
                        <span style={{ fontSize: 13.5, fontWeight: 400, whiteSpace: "nowrap" }}>
                            Settings
                        </span>
                    )}
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
