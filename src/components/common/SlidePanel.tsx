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
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-gray-900 border-l border-gray-700 shadow-xl transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-14 px-5 border-b border-gray-700">
          <h2 className="text-base font-semibold text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-3.5rem)]">
          {children}
        </div>
      </div>
    </>
  );
};

export default SlidePanel;
