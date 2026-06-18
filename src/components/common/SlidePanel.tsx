import { useEffect } from "react";
import { X } from "lucide-react";

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const SlidePanel = ({ open, onClose, title, children }: SlidePanelProps) => {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-[32rem] bg-surface-container-lowest border-l border-outline-variant shadow-xl animate-slide-in-right">
        <div className="flex items-center justify-between h-14 px-6 border-b border-outline-variant">
          <h2 className="text-base font-semibold text-on-surface">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-3.5rem)]">{children}</div>
      </div>
    </>
  );
};

export default SlidePanel;
