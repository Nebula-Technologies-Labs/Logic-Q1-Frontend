import { useState } from "react";
import { X } from "lucide-react";
import type { Contact } from "../types/contact.types";
import { CONTACT_SOURCES, BLANK_CONTACT } from "../types/contact.types";

interface ContactFormModalProps {
    contact?: Contact;
    onSave: (contact: Partial<Contact>) => Promise<void>;
    onCancel: () => void;
}

// Extracted outside to avoid focus loss on re-renders
function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "#8899B0",
                marginBottom: 5,
            }}
        >
            {children}
        </div>
    );
}

interface FieldProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    as?: "input" | "textarea" | "select";
    rows?: number;
    type?: string;
    options?: string[];
    error?: string;
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    as = "input",
    rows = 3,
    type = "text",
    options,
    error,
}: FieldProps) {
    const [focus, setFocus] = useState(false);
    const base = {
        width: "100%",
        padding: "8px 11px",
        fontSize: 13.5,
        color: "#0D1625",
        background: "#FFFFFF",
        outline: "none",
        transition: "border-color .15s, box-shadow .15s",
        border: `1px solid ${error ? "#DC2626" : focus ? "#2563EB" : "#C4D5F1"}`, // Default border to fix UI issue
        boxShadow: focus && !error ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
        borderRadius: 8,
        boxSizing: "border-box" as const,
        fontFamily: "inherit",
    };
    return (
        <div>
            <FieldLabel>{label}</FieldLabel>
            {as === "textarea" ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={rows}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    style={{ ...base, resize: "vertical" }}
                />
            ) : as === "select" ? (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    style={{
                        ...base,
                        appearance: "none",
                        cursor: "pointer",
                        color: value ? "#0D1625" : "#8899B0",
                    }}
                >
                    <option value="">{placeholder}</option>
                    {options?.map((o) => (
                        <option key={o} value={o}>
                            {o}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    style={base}
                />
            )}
            {error && <div style={{ color: "#DC2626", fontSize: 11, marginTop: 4 }}>{error}</div>}
        </div>
    );
}

function Grid2({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>
    );
}

function FormDivider({ label }: { label: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "22px 0 16px" }}>
            <span
                style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#8899B0",
                    whiteSpace: "nowrap",
                }}
            >
                {label}
            </span>
            <div style={{ flex: 1, height: 1, background: "#C4D5F1" }} />
        </div>
    );
}

const ContactFormModal = ({ contact, onSave, onCancel }: ContactFormModalProps) => {
    const [form, setForm] = useState<Partial<Contact>>(contact || BLANK_CONTACT);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const fld = (k: keyof Contact) => (val: string) => {
        setForm((prev) => ({ ...prev, [k]: val }));
        if (errors[k]) {
            setErrors((prev) => ({ ...prev, [k]: "" }));
        }
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        const nameRegex = /^[A-Za-z\s]+$/;

        if (!form.name?.trim()) {
            errs.name = "Name is required";
        } else if (!nameRegex.test(form.name.trim())) {
            errs.name = "Name cannot contain numbers or special characters";
        }

        if (!form.email?.trim()) {
            errs.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            errs.email = "Invalid email format";
        }

        if (form.phoneNumber && !/^\d{10}$/.test(form.phoneNumber.trim().replace(/\D/g, ""))) {
            errs.phoneNumber = "Mobile number must have exactly 10 digits";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            await onSave(form);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <aside
            style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: 430,
                background: "#FFFFFF",
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                boxShadow: "-12px 0 48px rgba(13,22,37,.12)",
                animation: "slideIn .22s ease",
            }}
        >
            <div
                style={{
                    padding: "20px 24px",
                    borderBottom: "1px solid #C4D5F1",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    flexShrink: 0,
                }}
            >
                <div>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0D1625" }}>
                        {contact ? "Edit Contact" : "New Contact"}
                    </h2>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8899B0" }}>
                        {contact ? "Update this contact's details" : "Fill in the details below"}
                    </p>
                </div>
                <button
                    onClick={onCancel}
                    style={{
                        border: "none",
                        background: "#EEF4FF",
                        borderRadius: 7,
                        width: 30,
                        height: 30,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                    }}
                >
                    <X size={15} color="#4A5568" />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "4px 24px 20px" }}>
                <FormDivider label="Identity" />
                <Grid2>
                    <div style={{ gridColumn: "1/-1" }}>
                        <Field
                            label="Full Name *"
                            value={form.name || ""}
                            onChange={fld("name")}
                            placeholder="e.g. Sarah Mitchell"
                            error={errors.name}
                        />
                    </div>
                    <Field
                        label="Email *"
                        value={form.email || ""}
                        onChange={fld("email")}
                        placeholder="work@company.com"
                        type="email"
                        error={errors.email}
                    />
                    <Field
                        label="Secondary Email"
                        value={form.secondaryEmail || ""}
                        onChange={fld("secondaryEmail")}
                        placeholder="personal@gmail.com"
                        type="email"
                    />
                    <div style={{ gridColumn: "1/-1" }}>
                        <Field
                            label="Phone Number"
                            value={form.phoneNumber || ""}
                            onChange={fld("phoneNumber")}
                            placeholder="1234567890"
                            error={errors.phoneNumber}
                        />
                    </div>
                </Grid2>
                <FormDivider label="Work" />
                <Grid2>
                    <Field
                        label="Job Title"
                        value={form.title || ""}
                        onChange={fld("title")}
                        placeholder="e.g. VP of Sales"
                    />
                    <Field
                        label="Department"
                        value={form.department || ""}
                        onChange={fld("department")}
                        placeholder="e.g. Marketing"
                    />
                    <div style={{ gridColumn: "1/-1" }}>
                        <Field
                            as="select"
                            label="Contact Source"
                            value={form.contactSource || form.ContactSource || ""}
                            onChange={fld("contactSource")}
                            placeholder="Select a source"
                            options={CONTACT_SOURCES}
                        />
                    </div>
                </Grid2>
                <FormDivider label="Location" />
                <Grid2>
                    <Field
                        label="Country"
                        value={form.country || ""}
                        onChange={fld("country")}
                        placeholder="e.g. United States"
                    />
                    <Field
                        label="State"
                        value={form.state || ""}
                        onChange={fld("state")}
                        placeholder="e.g. California"
                    />
                    <div style={{ gridColumn: "1/-1" }}>
                        <Field
                            label="City"
                            value={form.city || ""}
                            onChange={fld("city")}
                            placeholder="e.g. San Francisco"
                        />
                    </div>
                </Grid2>
                <FormDivider label="Notes & Context" />
                <div style={{ marginBottom: 14 }}>
                    <Field
                        as="textarea"
                        label="Description"
                        value={form.description || ""}
                        onChange={fld("description")}
                        placeholder="Brief overview of this contact…"
                        rows={3}
                    />
                </div>
                <Field
                    as="textarea"
                    label="Note"
                    value={form.note || ""}
                    onChange={fld("note")}
                    placeholder="Add follow-up notes or reminders…"
                    rows={3}
                />
            </div>

            <div
                style={{
                    padding: "16px 24px",
                    borderTop: "1px solid #C4D5F1",
                    display: "flex",
                    gap: 10,
                    flexShrink: 0,
                }}
            >
                <button
                    onClick={handleSave}
                    disabled={submitting}
                    style={{
                        flex: 1,
                        padding: "10px",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: submitting ? "not-allowed" : "pointer",
                        background: submitting ? "#B5C9E8" : "#2563EB",
                        color: "#fff",
                        fontFamily: "inherit",
                    }}
                >
                    {submitting ? "Saving..." : contact ? "Save Changes" : "Save Contact"}
                </button>
                <button
                    onClick={onCancel}
                    style={{
                        flex: 1,
                        padding: "10px",
                        background: "#EEF4FF",
                        color: "#4A5568",
                        border: "1px solid #C4D5F1",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                    }}
                >
                    Cancel
                </button>
            </div>
        </aside>
    );
};

export default ContactFormModal;
