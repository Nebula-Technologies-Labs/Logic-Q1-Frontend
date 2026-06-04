import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import SlidePanel from "./SlidePanel";

interface PhoneEntry {
  id: string;
  number: string;
  type: "work" | "personal";
}

interface EmailEntry {
  id: string;
  address: string;
  type: "work" | "personal";
}

export interface PersonFormData {
  id?: string;
  firstName: string;
  lastName: string;
  organization: string;
  phones: PhoneEntry[];
  emails: EmailEntry[];
  label: string;
  owner: string;
  visibleTo: "everyone" | "only_me" | "team";
  status: string;
}

interface ContactFormModalProps {
  open: boolean;
  initialData?: PersonFormData;
  onClose: () => void;
  onSave: (data: PersonFormData) => void;
}

const labelOptions = ["None", "Client", "Partner", "Supplier", "Internal", "VIP"];
const visibleOptions = [
  { value: "everyone", label: "Everyone" },
  { value: "only_me", label: "Only me" },
  { value: "team", label: "Team" },
];
const statusOptions = ["Active", "Inactive", "Pending", "New", "Closed"];

let _phoneId = 100;
let _emailId = 100;

const ContactFormModal = ({ open, initialData, onClose, onSave }: ContactFormModalProps) => {
  const [firstName, setFirstName] = useState(initialData?.firstName ?? "");
  const [lastName, setLastName] = useState(initialData?.lastName ?? "");
  const [organization, setOrganization] = useState(initialData?.organization ?? "");
  const [phones, setPhones] = useState<PhoneEntry[]>(
    initialData?.phones?.length
      ? initialData.phones
      : [{ id: String(_phoneId++), number: "", type: "work" }]
  );
  const [emails, setEmails] = useState<EmailEntry[]>(
    initialData?.emails?.length
      ? initialData.emails
      : [{ id: String(_emailId++), address: "", type: "work" }]
  );
  const [label, setLabel] = useState(initialData?.label ?? "None");
  const [owner, setOwner] = useState(initialData?.owner ?? "");
  const [visibleTo, setVisibleTo] = useState<"everyone" | "only_me" | "team">(
    (initialData?.visibleTo as "everyone" | "only_me" | "team") ?? "everyone"
  );
  const [status, setStatus] = useState(initialData?.status ?? "New");

  const addPhone = () =>
    setPhones((prev) => [...prev, { id: String(_phoneId++), number: "", type: "work" }]);

  const removePhone = (id: string) =>
    setPhones((prev) => prev.filter((p) => p.id !== id));

  const updatePhone = (id: string, field: "number" | "type", value: string) =>
    setPhones((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: field === "type" ? (value as "work" | "personal") : value } : p))
    );

  const addEmail = () =>
    setEmails((prev) => [...prev, { id: String(_emailId++), address: "", type: "work" }]);

  const removeEmail = (id: string) =>
    setEmails((prev) => prev.filter((e) => e.id !== id));

  const updateEmail = (id: string, field: "address" | "type", value: string) =>
    setEmails((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, [field]: field === "type" ? (value as "work" | "personal") : value } : e
      )
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    onSave({
      id: initialData?.id,
      firstName,
      lastName,
      organization,
      phones: phones.filter((p) => p.number.trim()),
      emails: emails.filter((e) => e.address.trim()),
      label,
      owner,
      visibleTo,
      status,
    });
  };

  return (
    <SlidePanel open={open} onClose={onClose} title={initialData ? "Edit Person" : "Add New Person"}>
      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Doe"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Organization</label>
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Acme Corp"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-300">Phone Numbers</label>
            <button type="button" onClick={addPhone} className="text-xs text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1">
              <Plus size={14} /> Add another
            </button>
          </div>
          <div className="space-y-2">
            {phones.map((phone) => (
              <div key={phone.id} className="flex items-center gap-2">
                <input
                  type="tel"
                  value={phone.number}
                  onChange={(e) => updatePhone(phone.id, "number", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
                <select
                  value={phone.type}
                  onChange={(e) => updatePhone(phone.id, "type", e.target.value)}
                  className="w-28 px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                </select>
                {phones.length > 1 && (
                  <button type="button" onClick={() => removePhone(phone.id)} className="p-2 text-gray-400 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-300">Email Addresses</label>
            <button type="button" onClick={addEmail} className="text-xs text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1">
              <Plus size={14} /> Add another
            </button>
          </div>
          <div className="space-y-2">
            {emails.map((email) => (
              <div key={email.id} className="flex items-center gap-2">
                <input
                  type="email"
                  value={email.address}
                  onChange={(e) => updateEmail(email.id, "address", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@acme.com"
                />
                <select
                  value={email.type}
                  onChange={(e) => updateEmail(email.id, "type", e.target.value)}
                  className="w-28 px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                </select>
                {emails.length > 1 && (
                  <button type="button" onClick={() => removeEmail(email.id)} className="p-2 text-gray-400 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Label</label>
            <select
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {labelOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Owner</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Assign to..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Visible To</label>
            <select
              value={visibleTo}
              onChange={(e) => setVisibleTo(e.target.value as "everyone" | "only_me" | "team")}
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {visibleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
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

export default ContactFormModal;