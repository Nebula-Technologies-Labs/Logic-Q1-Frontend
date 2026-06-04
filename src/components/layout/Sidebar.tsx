import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Target, X, ChevronDown } from "lucide-react";

const crmChildren = [
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/leads", label: "Leads", icon: Target },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const location = useLocation();
  const isCrmActive = location.pathname === "/" || location.pathname.startsWith("/contacts") || location.pathname.startsWith("/leads");
  const [crmOpen, setCrmOpen] = useState(isCrmActive);

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
          fixed top-0 left-0 z-50 h-full w-44 bg-gray-900 border-r border-gray-700
          transform transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-700">
          <span className="text-sm font-bold text-gray-100">Menu</span>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-gray-700"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        <nav className="mt-2 px-2 space-y-1">
          <div>
            <button
              onClick={() => setCrmOpen(!crmOpen)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isCrmActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={18} />
                CRM
              </div>
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${crmOpen ? "rotate-0" : "-rotate-90"}`}
              />
            </button>
            {crmOpen && (
              <div className="ml-2 mt-1 space-y-1">
                {crmChildren.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/contacts"}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                      }`
                    }
                  >
                    <Icon size={16} />
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
