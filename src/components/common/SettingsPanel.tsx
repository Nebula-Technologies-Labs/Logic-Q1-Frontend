import SlidePanel from "./SlidePanel";
import { usePreferences } from "../../hooks/usePreferences";
import { useNavigate } from "react-router-dom";

interface SettingsPanelProps {
 open: boolean;
 onClose: () => void;
}

const pageOptions = [
  { value: "/", label: "Dashboard" },
  { value: "/contacts", label: "Contacts" },
  { value: "/organizations", label: "Organizations" },
  { value: "/leads", label: "Leads" },
 { value: "/pipeline", label: "Pipeline" },
 { value: "/tasks", label: "Tasks" },
 { value: "/activity", label: "Activity" },
];

const SettingsPanel = ({ open, onClose }: SettingsPanelProps) => {
 const { preferences, updatePreference, resetPreferences } = usePreferences();
 const navigate = useNavigate();

 const inputClass = "w-full px-3 py-2 border border-outline-variant text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
 const labelClass = "block text-sm font-medium text-on-surface-variant mb-1";
 const sectionClass = "pb-6 border-b border-outline-variant last:border-0";

 return (
  <SlidePanel open={open} onClose={onClose} title="Settings">
 <div className="p-6 space-y-6">
  <div className={sectionClass}>
   <h3 className="text-sm font-bold text-on-surface mb-4">Display Preferences</h3>
   <div className="space-y-4">
  <div>
   <label className={labelClass}>Default Landing Page</label>
   <select
    value={preferences.defaultPage}
    onChange={(e) => updatePreference("defaultPage", e.target.value)}
    className={inputClass}
   >
    {pageOptions.map((opt) => (
   <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
   </select>
  </div>
  <div>
   <label className={labelClass}>Items Per Page</label>
   <select
    value={preferences.itemsPerPage}
    onChange={(e) => updatePreference("itemsPerPage", Number(e.target.value))}
    className={inputClass}
   >
    <option value={5}>5</option>
    <option value={10}>10</option>
    <option value={20}>20</option>
    <option value={50}>50</option>
   </select>
  </div>
  <div>
   <label className={labelClass}>Default Date Range</label>
   <select
    value={preferences.dateRange}
    onChange={(e) => updatePreference("dateRange", e.target.value)}
    className={inputClass}
   >
    <option value="7">Last 7 Days</option>
    <option value="30">Last 30 Days</option>
    <option value="90">Last 90 Days</option>
    <option value="all">All Time</option>
   </select>
  </div>
   </div>
  </div>

  <div className={sectionClass}>
   <h3 className="text-sm font-bold text-on-surface mb-4">Profile</h3>
   <div className="space-y-4">
  <div>
   <label className={labelClass}>Display Name</label>
   <input
    type="text"
    value={preferences.defaultPage}
    className={inputClass + " opacity-60"}
    disabled
    placeholder="Will be editable after API integration"
   />
   <p className="text-xs text-on-surface-variant mt-1">Name syncs from your account</p>
  </div>
  <button
   onClick={() => { onClose(); navigate("/login"); localStorage.removeItem("token"); }}
   className="w-full px-4 py-2 text-body-md font-medium text-error bg-error-container hover:bg-error-container/80 transition-colors"
  >
   Sign Out of All Devices
  </button>
   </div>
  </div>

  <div className={sectionClass}>
   <h3 className="text-sm font-bold text-on-surface mb-4">Notifications</h3>
   <div className="space-y-4">
  {[
   { key: "emailNotifications" as const, label: "Email Notifications" },
   { key: "pushNotifications" as const, label: "Push Notifications" },
   { key: "dailyDigest" as const, label: "Daily Digest" },
  ].map(({ key, label }) => (
   <div key={key} className="flex items-center justify-between">
    <span className="text-sm text-on-surface">{label}</span>
    <button
   onClick={() => updatePreference(key, !preferences[key])}
   className={`relative w-10 h-6 transition-colors ${
    preferences[key] ? "bg-primary" : "bg-outline-variant"
   }`}
    >
   <span
    className={`absolute top-0.5 w-5 h-5 bg-white shadow-sm transition-transform ${
     preferences[key] ? "translate-x-[18px]" : "translate-x-0.5"
    }`}
   />
    </button>
   </div>
  ))}
   </div>
  </div>

  <div className="pt-4">
   <button
  onClick={resetPreferences}
  className="w-full px-4 py-2 text-body-md font-medium text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors"
   >
  Reset All Preferences
   </button>
  </div>
 </div>
  </SlidePanel>
 );
};

export default SettingsPanel;

