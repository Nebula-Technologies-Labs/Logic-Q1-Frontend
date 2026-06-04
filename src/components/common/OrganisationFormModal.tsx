import { useState } from "react";
import SlidePanel from "./SlidePanel";

export interface OrganisationFormData {
  name: string;
  industry: string;
  phone: string;
  email: string;
  website: string;
  address: string;
}

interface OrganisationFormModalProps {
  open: boolean;
  initialData?: OrganisationFormData;
  onClose: () => void;
  onSave: (data: OrganisationFormData) => void;
}

const industryOptions = [
  "Technology", "Research", "Manufacturing", "Pharmaceuticals",
  "Insurance", "Defense", "Finance", "Healthcare", "Education", "Other",
];

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
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Acme Corp"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {industryOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(555) 000-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="info@acme.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://acme.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123 Main St, City, Country"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            {initialData ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </SlidePanel>
  );
};

export default OrganisationFormModal;