import { useState } from "react";
import SlidePanel from "./SlidePanel";

export interface OrganisationFormData {
 name: string; industry: string; phone: string; email: string; website: string; address: string;
}

interface OrganisationFormModalProps {
 open: boolean; initialData?: OrganisationFormData;
 onClose: () => void; onSave: (data: OrganisationFormData) => void;
}

const industryOptions = [
 "Technology", "Research", "Manufacturing", "Pharmaceuticals",
 "Insurance", "Defense", "Finance", "Healthcare", "Education", "Other",
];

const inputClass = "w-full px-3 py-2 border border-outline-variant text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
const labelClass = "block text-sm font-medium text-on-surface-variant mb-1";

const OrganisationFormModal = ({ open, initialData, onClose, onSave }: OrganisationFormModalProps) => {
 const [name, setName] = useState(initialData?.name ?? "");
 const [industry, setIndustry] = useState(initialData?.industry ?? "Technology");
 const [phone, setPhone] = useState(initialData?.phone ?? "");
 const [email, setEmail] = useState(initialData?.email ?? "");
 const [website, setWebsite] = useState(initialData?.website ?? "");
 const [address, setAddress] = useState(initialData?.address ?? "");

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!name.trim()) return;
  onSave({ name, industry, phone, email, website, address });
 };

 return (
  <SlidePanel open={open} onClose={onClose} title={initialData ? "Edit Organisation" : "Add New Organisation"}>
 <form onSubmit={handleSubmit} className="p-6 space-y-4">
  <div>
   <label className={labelClass}>Name</label>
   <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Acme Corp" required />
  </div>
  <div className="grid grid-cols-2 gap-4">
   <div>
  <label className={labelClass}>Industry</label>
  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass}>
   {industryOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
  </select>
   </div>
   <div>
  <label className={labelClass}>Phone</label>
  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="(555) 000-0000" />
   </div>
   <div>
  <label className={labelClass}>Email</label>
  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="info@acme.com" />
   </div>
   <div>
  <label className={labelClass}>Website</label>
  <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} placeholder="https://acme.com" />
   </div>
  </div>
  <div>
   <label className={labelClass}>Address</label>
   <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className={inputClass} placeholder="123 Main St, City, Country" />
  </div>
  <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant">
   <button type="button" onClick={onClose}
  className="px-4 py-2 text-sm font-medium text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors">Cancel</button>
   <button type="submit"
  className="px-4 py-2 text-sm font-medium text-on-primary bg-primary hover:opacity-90 transition-all shadow-sm">{initialData ? "Update" : "Save"}</button>
  </div>
 </form>
  </SlidePanel>
 );
};

export default OrganisationFormModal;

