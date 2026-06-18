import { Keyboard, BookOpen, MessageCircle, ExternalLink } from "lucide-react";
import SlidePanel from "./SlidePanel";

interface HelpPanelProps {
 open: boolean;
 onClose: () => void;
}

const shortcuts = [
 { keys: "Ctrl + K", label: "Quick Search" },
 { keys: "Ctrl + N", label: "Add New Item" },
 { keys: "Ctrl + ,", label: "Open Settings" },
 { keys: "G + D", label: "Go to Dashboard" },
 { keys: "G + C", label: "Go to Contacts" },
 { keys: "G + P", label: "Go to Pipeline" },
 { keys: "Escape", label: "Close Panel / Cancel" },
];

const links = [
 { icon: BookOpen, label: "Documentation", desc: "Read the full user guide", href: "#" },
 { icon: MessageCircle, label: "Support Center", desc: "Get help from our team", href: "#" },
 { icon: ExternalLink, label: "API Reference", desc: "For developers integrating with Logic Q1", href: "#" },
];

const HelpPanel = ({ open, onClose }: HelpPanelProps) => {
 return (
  <SlidePanel open={open} onClose={onClose} title="Help & Support">
 <div className="p-6 space-y-8">
  <div>
   <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
  <Keyboard size={16} /> Keyboard Shortcuts
   </h3>
   <div className="space-y-2">
  {shortcuts.map((s) => (
   <div key={s.keys} className="flex items-center justify-between py-1.5">
    <span className="text-sm text-on-surface-variant">{s.label}</span>
    <kbd className="text-[11px] font-mono px-2 py-0.5 bg-surface-container border border-outline-variant text-on-surface-variant">
   {s.keys}
    </kbd>
   </div>
  ))}
   </div>
  </div>

  <div className="border-t border-outline-variant pt-6">
   <h3 className="text-sm font-bold text-on-surface mb-4">Resources</h3>
   <div className="space-y-3">
  {links.map((link) => {
   const Icon = link.icon;
   return (
    <a
   key={link.label}
   href={link.href}
   className="flex items-start gap-4 p-4 bg-surface-container hover:bg-surface-container-high transition-colors group"
    >
   <div className="w-9 h-9 bg-primary-fixed flex items-center justify-center shrink-0">
    <Icon size={18} className="text-primary" />
   </div>
   <div className="flex-1 min-w-0">
    <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{link.label}</p>
    <p className="text-xs text-on-surface-variant mt-0.5">{link.desc}</p>
   </div>
    </a>
   );
  })}
   </div>
  </div>

  <div className="border-t border-outline-variant pt-6">
   <p className="text-xs text-on-surface-variant">Logic Q1 CRM v0.1.0</p>
  </div>
 </div>
  </SlidePanel>
 );
};

export default HelpPanel;

