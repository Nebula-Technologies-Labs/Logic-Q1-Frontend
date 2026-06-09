import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  LayoutDashboard, Users, Target, X, BarChart3,
  CheckSquare, MessageSquare, Timer, User, Settings, LogOut, ChevronUp
} from "lucide-react";
import SettingsPanel from "../common/SettingsPanel";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/leads", label: "Leads", icon: Target },
  { to: "/pipeline", label: "Pipeline", icon: BarChart3 },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/activity", label: "Activity", icon: Timer },
  { to: "/communication", label: "Communication", icon: MessageSquare },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function decodeToken(token: string): { name?: string; email?: string } | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const userInfo = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = decodeToken(token);
    if (decoded?.name || decoded?.email) return decoded;
    try {
      const fallback = localStorage.getItem("user_info");
      if (fallback) return JSON.parse(fallback);
    } catch { /* ignore */ }
    return null;
  }, []);

  const displayName = userInfo?.name || userInfo?.email || "Signed In";
  const initials = userInfo?.name ? getUserInitials(userInfo.name) : userInfo?.email?.[0].toUpperCase() || "?";

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_info");
    setUserMenuOpen(false);
    navigate("/login");
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-surface-container-low border-r border-outline-variant
          transform transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0
          shadow-lg lg:shadow-none
          flex flex-col
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-6 flex items-center gap-4 border-b border-outline-variant">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="font-bold text-sm text-on-surface">Logic Q1</h1>
            <p className="text-label-sm text-on-surface-variant opacity-70">CRM</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-1 rounded hover:bg-surface-container-high"
          >
            <X size={18} className="text-on-surface-variant" />
          </button>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-base">
          {navItems.map(({ to, label, icon: Icon, end }) => {
            const isActive = end
              ? location.pathname === to
              : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-primary-container text-on-primary-container font-bold"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-outline-variant relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-4 p-2 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-sm font-bold text-primary shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-bold text-on-surface truncate">{displayName}</p>
              <p className="text-xs text-on-surface-variant truncate">{userInfo?.email || ""}</p>
            </div>
            <ChevronUp size={16} className={`text-on-surface-variant transition-transform ${userMenuOpen ? "" : "rotate-180"}`} />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl overflow-hidden z-20">
                <button
                  onClick={() => { setUserMenuOpen(false); setSettingsOpen(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <Settings size={16} className="text-on-surface-variant" />
                  Settings
                </button>
                <button
                  onClick={() => { setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <User size={16} className="text-on-surface-variant" />
                  View Profile
                </button>
                <div className="border-t border-outline-variant" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error-container transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default Sidebar;
