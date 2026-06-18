import { X } from "lucide-react";

interface ConfirmDialogProps {
 title: string;
 message: string;
 onConfirm: () => void;
 onCancel: () => void;
}

const ConfirmDialog = ({ title, message, onConfirm, onCancel }: ConfirmDialogProps) => {
 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
 <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
 <div className="relative bg-surface-container-lowest shadow-xl w-full max-w-[24rem] mx-4 p-6 border border-outline-variant">
  <div className="flex items-center justify-between mb-3">
   <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
   <button onClick={onCancel} className="p-1 rounded hover:bg-surface-container">
  <X size={18} className="text-on-surface-variant" />
   </button>
  </div>
  <p className="text-sm text-on-surface-variant mb-6">{message}</p>
  <div className="flex justify-end gap-2">
   <button onClick={onCancel}
  className="px-4 py-2 text-sm font-medium text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors">Cancel</button>
   <button onClick={onConfirm}
  className="px-4 py-2 text-sm font-medium text-white bg-error hover:bg-on-error-container transition-colors">Delete</button>
  </div>
 </div>
  </div>
 );
};

export default ConfirmDialog;

