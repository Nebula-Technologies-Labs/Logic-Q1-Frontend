import { useState } from "react";
import { X, Bell, CheckCheck, Mail, MessageSquare, Target, BarChart3 } from "lucide-react";

interface Notification {
 id: string;
 title: string;
 message: string;
 type: "message" | "lead" | "deal" | "task";
 read: boolean;
 time: string;
}

const seedNotifications: Notification[] = [];

const typeIcons = {
 message: Mail,
 lead: Target,
 deal: BarChart3,
 task: Bell,
};

const typeBg = {
 message: "bg-secondary-container",
 lead: "bg-tertiary-fixed",
 deal: "bg-primary-container",
 task: "bg-surface-container",
};

const typeIconColor = {
 message: "text-primary",
 lead: "text-tertiary",
 deal: "text-on-primary-container",
 task: "text-outline",
};

interface NotificationPanelProps {
 onClose: () => void;
}

const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
 const [notifications, setNotifications] = useState(seedNotifications);
 const unreadCount = notifications.filter((n) => !n.read).length;

 const markAllRead = () => {
  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
 };

 const markRead = (id: string) => {
  setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
 };

 return (
  <>
 <div className="fixed inset-0 z-40" onClick={onClose} />
 <div className="absolute top-full right-0 mt-2 z-50 w-[22rem] bg-surface-container-lowest border border-outline-variant shadow-xl overflow-hidden">
  <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
   <div className="flex items-center gap-2">
  <Bell size={18} className="text-on-surface" />
  <h3 className="text-sm font-bold text-on-surface">Notifications</h3>
  {unreadCount > 0 && (
   <span className="text-[10px] font-bold bg-primary text-on-primary px-1.5 py-0.5 ">{unreadCount}</span>
  )}
   </div>
   <div className="flex items-center gap-2">
  {unreadCount > 0 && (
   <button onClick={markAllRead} className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
    <CheckCheck size={14} /> Mark all read
   </button>
  )}
  <button onClick={onClose} className="p-1 rounded hover:bg-surface-container text-on-surface-variant">
   <X size={16} />
  </button>
   </div>
  </div>

  <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant">
   {notifications.length === 0 ? (
  <div className="text-center py-10 text-sm text-on-surface-variant">
   <Bell size={32} className="mx-auto mb-2 opacity-40" />
   No notifications yet
  </div>
   ) : notifications.map((n) => {
  const Icon = typeIcons[n.type];
  const bg = typeBg[n.type];
  const iconCls = typeIconColor[n.type];
  return (
   <div
    key={n.id}
    onClick={() => markRead(n.id)}
    className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-surface-container-low ${
   !n.read ? "bg-surface-container-low/50" : ""
    }`}
   >
    <div className={`w-8 h-8 ${bg} flex items-center justify-center shrink-0`}>
   <Icon size={16} className={iconCls} />
    </div>
    <div className="flex-1 min-w-0">
   <p className={`text-sm ${!n.read ? "font-bold text-on-surface" : "text-on-surface"}`}>{n.title}</p>
   <p className="text-xs text-on-surface-variant mt-0.5 truncate">{n.message}</p>
   <span className="text-[10px] text-outline mt-0.5 block">{n.time}</span>
    </div>
    {!n.read && <span className="w-2 h-2 bg-primary shrink-0 mt-1" />}
   </div>
  );
   })}
  </div>

  <div className="px-5 py-3 border-t border-outline-variant text-center">
   <button className="text-xs text-primary hover:underline font-medium">View All Notifications</button>
  </div>
 </div>
  </>
 );
};

export default NotificationPanel;

