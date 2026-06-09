import { useState } from "react";
import { Search, Plus, Menu, Bell, HelpCircle, Settings } from "lucide-react";
import NotificationPanel from "../common/NotificationPanel";
import HelpPanel from "../common/HelpPanel";
import SettingsPanel from "../common/SettingsPanel";

interface NavbarProps {
  onMenuClick: () => void;
  onSearch: (value: string) => void;
  onAddNew?: () => void;
  searchValue: string;
}

const Navbar = ({ onMenuClick, onSearch, onAddNew, searchValue }: NavbarProps) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="flex justify-between items-center w-full px-6 h-16 bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-30">
      <div className="flex items-center gap-4 w-1/3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
        >
          <Menu size={20} />
        </button>
        <div className="relative w-full max-w-[28rem]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search pipeline, deals, or contacts..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md transition-all text-on-surface placeholder:text-outline"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-medium hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add New</span>
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <Bell size={20} />
          </button>
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </div>
        <button
          onClick={() => setHelpOpen(true)}
          className="p-2 text-on-surface-variant hover:text-primary transition-colors"
        >
          <HelpCircle size={20} />
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 text-on-surface-variant hover:text-primary transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>

      <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
};

export default Navbar;
