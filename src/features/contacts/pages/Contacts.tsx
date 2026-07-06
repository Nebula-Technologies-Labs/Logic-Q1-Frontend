import { useState, useEffect } from "react";
import { Plus, Search, MapPin, Loader2, Users, ChevronRight } from "lucide-react";

import type { Contact } from "../types/contact.types";
import ContactFormModal from "../components/ContactFormModal";
import ContactDetailPanel from "../components/ContactDetailPanel";
import ConfirmDialog from "../components/ConfirmDialog";
import {
    getContactsByOrg,
    createContact,
    updateContact,
    deleteContact,
} from "../api/contact.service";
import { useAuth } from "../../auth/hooks/useAuth";

const AV_COLORS = ["#2563EB", "#0891B2", "#059669", "#7C3AED", "#EA580C", "#0D9488"];
const avatarBg = (name: string) => {
    let s = 0;
    for (const c of name) s += c.charCodeAt(0);
    return AV_COLORS[s % AV_COLORS.length];
};
const initials = (name: string) =>
    name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

function Avatar({
    name,
    size = 36,
    fontSize = 12,
}: {
    name: string;
    size?: number;
    fontSize?: number;
}) {
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: avatarBg(name),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}
        >
            <span style={{ color: "#fff", fontSize, fontWeight: 700 }}>{initials(name)}</span>
        </div>
    );
}

const Contacts = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
    const [search, setSearch] = useState("");
    const [hovered, setHovered] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchContacts = async () => {
            if (!user?.orgId) return;
            try {
                const data = await getContactsByOrg(user.orgId);
                if (mounted) setContacts(data);
            } catch (err) {
                console.error("Failed to load contacts:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchContacts();
        return () => {
            mounted = false;
        };
    }, [user?.orgId]);

    const loadContacts = async () => {
        if (!user?.orgId) return;
        try {
            const data = await getContactsByOrg(user.orgId);
            setContacts(data);
        } catch (err) {
            console.error("Failed to refresh contacts:", err);
        }
    };

    const filtered = contacts.filter((c) =>
        [c.name, c.email, c.title, c.city, c.department]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

    const openAdd = () => {
        setEditingContact(undefined);
        setFormOpen(true);
    };

    const handleSave = async (payload: Partial<Contact>) => {
        try {
            if (editingContact) {
                await updateContact(editingContact.id, payload);
            } else {
                await createContact({ ...payload, ownerId: user?.id });
            }
            await loadContacts(); // Re-fetch the data to get the latest state
            setFormOpen(false);
            setEditingContact(undefined);
            if (editingContact && selectedContact?.id === editingContact.id) {
                setSelectedContact(null);
            }
        } catch (err) {
            console.error("Failed to save contact:", err);
            alert("Failed to save contact.");
        }
    };

    const handleDelete = async () => {
        if (!contactToDelete) return;
        try {
            await deleteContact(contactToDelete.id);
            await loadContacts(); // Re-fetch to ensure sync
            if (selectedContact?.id === contactToDelete.id) {
                setSelectedContact(null);
            }
            setContactToDelete(null);
        } catch (err) {
            console.error("Failed to delete contact:", err);
            alert("Failed to delete contact.");
        }
    };

    const closeForm = () => {
        setFormOpen(false);
        if (editingContact) {
            setSelectedContact(editingContact);
        }
        setEditingContact(undefined);
    };

    if (loading) {
        return (
            <div
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
                <Loader2 className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                position: "relative",
            }}
        >
            {/* Page header */}
            <div style={{ padding: "24px 32px 0", background: "#F0F5FE", flexShrink: 0 }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 20,
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#0D1625",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Contacts
                        </h1>
                        <p style={{ margin: "3px 0 0", fontSize: 13, color: "#8899B0" }}>
                            {contacts.length} total · {filtered.length} shown
                        </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ position: "relative" }}>
                            <Search
                                size={13}
                                color="#8899B0"
                                style={{
                                    position: "absolute",
                                    left: 10,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    pointerEvents: "none",
                                }}
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search contacts…"
                                style={{
                                    padding: "8px 12px 8px 30px",
                                    fontSize: 13,
                                    border: "1.5px solid #C4D5F1",
                                    borderRadius: 8,
                                    background: "#FFFFFF",
                                    color: "#0D1625",
                                    outline: "none",
                                    width: 210,
                                    fontFamily: "inherit",
                                }}
                            />
                        </div>
                        {contacts.length > 0 && (
                            <button
                                onClick={openAdd}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "8px 16px",
                                    background: "#2563EB",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    fontSize: 13.5,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                }}
                            >
                                <Plus size={15} strokeWidth={2.5} /> Add Contact
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 32px 32px" }}>
                {contacts.length === 0 && !search ? (
                    <div
                        style={{
                            background: "#FFFFFF",
                            borderRadius: 11,
                            padding: "64px 24px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: 400,
                        }}
                    >
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                background: "#EEF4FF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 24,
                            }}
                        >
                            <Users size={28} color="#64748B" strokeWidth={1.5} />
                        </div>

                        <div style={{ textAlign: "center", marginBottom: 32 }}>
                            <h2
                                style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: "#0F172A",
                                    margin: 0,
                                    marginBottom: 8,
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                }}
                            >
                                Build your contact network
                            </h2>
                            <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
                                Add and manage all your contacts in one place.
                            </p>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 16,
                                marginBottom: 40,
                                width: "100%",
                                maxWidth: 360,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <ChevronRight size={14} color="#64748B" strokeWidth={2.5} />
                                <span style={{ fontSize: 13.5, color: "#4A5568" }}>
                                    <strong style={{ color: "#0D1625" }}>Organize</strong> contacts
                                    by organization and status
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <ChevronRight size={14} color="#64748B" strokeWidth={2.5} />
                                <span style={{ fontSize: 13.5, color: "#4A5568" }}>
                                    <strong style={{ color: "#0D1625" }}>Track</strong> phone
                                    numbers and email addresses
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <ChevronRight size={14} color="#64748B" strokeWidth={2.5} />
                                <span style={{ fontSize: 13.5, color: "#4A5568" }}>
                                    <strong style={{ color: "#0D1625" }}>Assign</strong> ownership
                                    and visibility per contact
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={openAdd}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "10px 20px",
                                background: "#1E293B",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#0F172A")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#1E293B")}
                        >
                            <Plus size={16} strokeWidth={2.5} /> Create Contact
                        </button>
                    </div>
                ) : (
                    <div
                        style={{
                            background: "#FFFFFF",
                            borderRadius: 11,
                            border: "1px solid #C4D5F1",
                            overflow: "hidden",
                        }}
                    >
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr
                                    style={{
                                        background: "#EEF4FF",
                                        borderBottom: "1px solid #C4D5F1",
                                    }}
                                >
                                    {[
                                        "Name & Email",
                                        "Phone",
                                        "Title & Department",
                                        "Location",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            style={{
                                                padding: "10px 18px",
                                                textAlign: "left",
                                                fontSize: 10.5,
                                                fontWeight: 700,
                                                letterSpacing: "0.07em",
                                                textTransform: "uppercase",
                                                color: "#8899B0",
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            style={{
                                                padding: "60px 0",
                                                textAlign: "center",
                                                color: "#8899B0",
                                                fontSize: 13.5,
                                            }}
                                        >
                                            No contacts match "
                                            <strong style={{ color: "#0D1625" }}>{search}</strong>".
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((c, i) => {
                                        const isSel = selectedContact?.id === c.id;
                                        const isHov = hovered === c.id && !isSel;
                                        return (
                                            <tr
                                                key={c.id}
                                                onClick={() => {
                                                    if (!formOpen) setSelectedContact(c);
                                                }}
                                                onMouseEnter={() => setHovered(c.id)}
                                                onMouseLeave={() => setHovered(null)}
                                                style={{
                                                    borderBottom:
                                                        i < filtered.length - 1
                                                            ? "1px solid #C4D5F1"
                                                            : "none",
                                                    cursor: "pointer",
                                                    background: isSel
                                                        ? "#EFF6FF"
                                                        : isHov
                                                          ? "#EEF4FF"
                                                          : "#FFFFFF",
                                                    borderLeft: isSel
                                                        ? "3px solid #2563EB"
                                                        : "3px solid transparent",
                                                    transition: "background .1s",
                                                }}
                                            >
                                                <td style={{ padding: "13px 18px 13px 15px" }}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 11,
                                                        }}
                                                    >
                                                        <Avatar name={c.name} />
                                                        <div>
                                                            <div
                                                                style={{
                                                                    fontWeight: 600,
                                                                    fontSize: 13.5,
                                                                    color: "#0D1625",
                                                                }}
                                                            >
                                                                {c.name}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: 12,
                                                                    color: "#4A5568",
                                                                    marginTop: 1,
                                                                }}
                                                            >
                                                                {c.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: "13px 18px" }}>
                                                    <span
                                                        style={{ fontSize: 13.5, color: "#4A5568" }}
                                                    >
                                                        {c.phoneNumber || "—"}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "13px 18px" }}>
                                                    <div
                                                        style={{
                                                            fontSize: 13.5,
                                                            fontWeight: 500,
                                                            color: "#0D1625",
                                                        }}
                                                    >
                                                        {c.title || "—"}
                                                    </div>
                                                    {c.department && (
                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                color: "#8899B0",
                                                                marginTop: 1,
                                                            }}
                                                        >
                                                            {c.department}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: "13px 18px" }}>
                                                    {c.city || c.country ? (
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 5,
                                                            }}
                                                        >
                                                            <MapPin size={12} color="#8899B0" />
                                                            <span
                                                                style={{
                                                                    fontSize: 13,
                                                                    color: "#4A5568",
                                                                }}
                                                            >
                                                                {[c.city, c.country]
                                                                    .filter(Boolean)
                                                                    .join(", ")}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: "#8899B0" }}>—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Overlay */}
            {(selectedContact || formOpen || contactToDelete) && (
                <div
                    onClick={() => {
                        if (!formOpen && !contactToDelete) setSelectedContact(null);
                    }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(13,22,37,.3)",
                        zIndex: 40,
                        backdropFilter: "blur(2px)",
                    }}
                />
            )}

            {/* Form Modal */}
            {formOpen && (
                <ContactFormModal
                    contact={editingContact}
                    onSave={handleSave}
                    onCancel={closeForm}
                />
            )}

            {/* Detail Panel */}
            {selectedContact && !formOpen && (
                <ContactDetailPanel
                    contact={selectedContact}
                    onClose={() => setSelectedContact(null)}
                    onEdit={() => {
                        setEditingContact(selectedContact);
                        setFormOpen(true);
                        setSelectedContact(null);
                    }}
                    onDelete={() => setContactToDelete(selectedContact)}
                />
            )}

            {/* Delete Dialog */}
            {contactToDelete && (
                <ConfirmDialog
                    title="Delete Contact"
                    message={`Are you sure you want to delete ${contactToDelete.name}?`}
                    onConfirm={handleDelete}
                    onCancel={() => setContactToDelete(null)}
                />
            )}
        </div>
    );
};

export default Contacts;
