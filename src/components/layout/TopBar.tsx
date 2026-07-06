import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";

import { useAuth } from "../../features/auth/hooks/useAuth";

const AV_COLORS = ["#2563EB", "#0891B2", "#059669", "#7C3AED", "#EA580C", "#0D9488"];

const avatarBg = (name: string): string => {
    let s = 0;
    for (const c of name) s += c.charCodeAt(0);
    return AV_COLORS[s % AV_COLORS.length];
};

const initials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (!parts.length) return "U";
    const f = parts[0]?.[0] || "";
    const l = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (f + l).toUpperCase() || "?";
};

const ROUTE_LABELS: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/contacts": "Contacts",
    "/deals": "Deals",
    "/companies": "Companies",
    "/reports": "Reports",
    "/settings": "Settings",
};

const TopBar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [userOpen, setUserOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setUserOpen(false);
            }
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const pageLabel = ROUTE_LABELS[location.pathname] || "Dashboard";
    const displayName = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "User";
    const displayEmail = user?.email || "user@example.com";

    return (
        <header className="topbar">
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 12.5, color: "#8899B0", fontWeight: 400 }}>Home</span>
                <span style={{ color: "#C4D5F1", fontSize: 16, lineHeight: 1 }}>›</span>
                <span style={{ fontSize: 13, color: "#0D1625", fontWeight: 600 }}>{pageLabel}</span>
            </div>

            {/* Right */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Bell */}
                <div style={{ position: "relative", cursor: "pointer", lineHeight: 0 }}>
                    <Bell size={17} color="#8899B0" strokeWidth={1.8} />
                    <div
                        style={{
                            position: "absolute",
                            top: -1,
                            right: -1,
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "#2563EB",
                            border: "1.5px solid #FFFFFF",
                        }}
                    />
                </div>

                <div style={{ width: 1, height: 20, background: "#C4D5F1" }} />

                {/* User Dropdown */}
                <div ref={menuRef} style={{ position: "relative" }}>
                    <div
                        onClick={() => setUserOpen((o) => !o)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            cursor: "pointer",
                            padding: "4px 8px 4px 4px",
                            borderRadius: 8,
                            background: userOpen ? "#EEF4FF" : "transparent",
                            transition: "background .12s",
                        }}
                    >
                        <div
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: avatarBg(displayName),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>
                                {initials(displayName)}
                            </span>
                        </div>
                        <div>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#0D1625",
                                    lineHeight: 1.3,
                                }}
                            >
                                {displayName}
                            </div>
                            <div style={{ fontSize: 10.5, color: "#8899B0", lineHeight: 1.2 }}>
                                Admin
                            </div>
                        </div>
                        <ChevronDown size={13} color="#8899B0" />
                    </div>

                    {userOpen && (
                        <div
                            style={{
                                position: "absolute",
                                top: 46,
                                right: 0,
                                background: "#FFFFFF",
                                border: "1px solid #C4D5F1",
                                borderRadius: 10,
                                boxShadow: "0 10px 30px rgba(13,22,37,.1)",
                                minWidth: 186,
                                overflow: "hidden",
                                zIndex: 100,
                            }}
                        >
                            <div
                                style={{ padding: "12px 14px", borderBottom: "1px solid #C4D5F1" }}
                            >
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#0D1625" }}>
                                    {displayName}
                                </div>
                                <div style={{ fontSize: 12, color: "#8899B0" }}>{displayEmail}</div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 9,
                                    padding: "10px 14px",
                                    cursor: "pointer",
                                    fontSize: 13.5,
                                    color: "#0D1625",
                                }}
                                className="hover:bg-[#EEF4FF]"
                            >
                                <User size={14} color="#4A5568" /> Profile
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 9,
                                    padding: "10px 14px",
                                    cursor: "pointer",
                                    fontSize: 13.5,
                                    color: "#0D1625",
                                }}
                                className="hover:bg-[#EEF4FF]"
                            >
                                <Settings size={14} color="#4A5568" /> Workspace Settings
                            </div>
                            <div style={{ height: 1, background: "#C4D5F1" }} />
                            <div
                                onClick={() => logout()}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 9,
                                    padding: "10px 14px",
                                    cursor: "pointer",
                                    fontSize: 13.5,
                                    color: "#DC2626",
                                }}
                                className="hover:bg-[#FEF2F2]"
                            >
                                <LogOut size={14} color="#DC2626" /> Sign Out
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
