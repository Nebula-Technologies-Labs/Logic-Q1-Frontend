import {
    Mail,
    Phone,
    User,
    Building2,
    MapPin,
    Globe,
    Tag,
    MoreVertical,
    Edit2,
    Trash2,
    X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Contact } from "../types/contact.types";

interface ContactDetailPanelProps {
    contact: Contact;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

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

function DRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value?: string;
}) {
    if (!value) return null;
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 11 }}>
            <div
                style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: "#EEF4FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon size={13} color="#8899B0" />
            </div>
            <div>
                <div style={{ fontSize: 11, color: "#8899B0" }}>{label}</div>
                <div style={{ fontSize: 13.5, color: "#0D1625", fontWeight: 500, marginTop: 1 }}>
                    {value}
                </div>
            </div>
        </div>
    );
}

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 22 }}>
            <div
                style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#8899B0",
                    marginBottom: 10,
                    paddingBottom: 7,
                    borderBottom: "1px solid #C4D5F1",
                }}
            >
                {label}
            </div>
            {children}
        </div>
    );
}

const ContactDetailPanel = ({ contact, onClose, onEdit, onDelete }: ContactDetailPanelProps) => {
    const [menu, setMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const source = contact.contactSource || contact.ContactSource;

    return (
        <aside
            style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: 368,
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
                    padding: "18px 20px",
                    borderBottom: "1px solid #C4D5F1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                    <Avatar name={contact.name} size={42} fontSize={14} />
                    <div style={{ minWidth: 0 }}>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: 15,
                                fontWeight: 700,
                                color: "#0D1625",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {contact.name}
                        </h3>
                        <p
                            style={{
                                margin: "2px 0 0",
                                fontSize: 12.5,
                                color: "#4A5568",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {[contact.title, contact.department].filter(Boolean).join(" · ") ||
                                "No title"}
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <div ref={menuRef} style={{ position: "relative" }}>
                        <button
                            onClick={() => setMenu((m) => !m)}
                            style={{
                                border: "none",
                                background: menu ? "#EEF4FF" : "transparent",
                                borderRadius: 7,
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                            }}
                        >
                            <MoreVertical size={16} color="#4A5568" />
                        </button>
                        {menu && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 36,
                                    right: 0,
                                    background: "#FFFFFF",
                                    border: "1px solid #C4D5F1",
                                    borderRadius: 9,
                                    boxShadow: "0 8px 28px rgba(13,22,37,.12)",
                                    zIndex: 100,
                                    minWidth: 170,
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    onClick={() => {
                                        onEdit();
                                        setMenu(false);
                                    }}
                                    className="hover:bg-[#EEF4FF]"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 9,
                                        padding: "10px 14px",
                                        cursor: "pointer",
                                        fontSize: 13.5,
                                        color: "#0D1625",
                                    }}
                                >
                                    <Edit2 size={14} color="#4A5568" /> Edit Contact
                                </div>
                                <div style={{ height: 1, background: "#C4D5F1" }} />
                                <div
                                    onClick={() => {
                                        onDelete();
                                        setMenu(false);
                                    }}
                                    className="hover:bg-[#FEF2F2]"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 9,
                                        padding: "10px 14px",
                                        cursor: "pointer",
                                        fontSize: 13.5,
                                        color: "#DC2626",
                                    }}
                                >
                                    <Trash2 size={14} color="#DC2626" /> Delete Contact
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            border: "none",
                            background: "#EEF4FF",
                            borderRadius: 7,
                            width: 32,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                        }}
                    >
                        <X size={15} color="#4A5568" />
                    </button>
                </div>
            </div>

            {source && (
                <div style={{ padding: "10px 20px", borderBottom: "1px solid #C4D5F1" }}>
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 10px",
                            background: "#EFF6FF",
                            color: "#2563EB",
                            borderRadius: 20,
                            fontSize: 11.5,
                            fontWeight: 600,
                        }}
                    >
                        <Tag size={10} /> {source}
                    </span>
                </div>
            )}

            <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
                <DetailSection label="Contact Information">
                    <DRow icon={Mail} label="Email" value={contact.email} />
                    {contact.secondaryEmail && (
                        <DRow icon={Mail} label="Alt. Email" value={contact.secondaryEmail} />
                    )}
                    <DRow icon={Phone} label="Phone" value={contact.phoneNumber} />
                </DetailSection>
                <DetailSection label="Work Details">
                    <DRow icon={User} label="Job Title" value={contact.title} />
                    <DRow icon={Building2} label="Department" value={contact.department} />
                </DetailSection>
                <DetailSection label="Location">
                    <DRow icon={MapPin} label="City" value={contact.city} />
                    <DRow icon={Globe} label="State" value={contact.state} />
                    <DRow icon={Globe} label="Country" value={contact.country} />
                </DetailSection>
                {(contact.description || contact.note) && (
                    <DetailSection label="Notes & Context">
                        {contact.description && (
                            <div style={{ marginBottom: 12 }}>
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
                                    Description
                                </div>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 13,
                                        color: "#4A5568",
                                        lineHeight: 1.65,
                                    }}
                                >
                                    {contact.description}
                                </p>
                            </div>
                        )}
                        {contact.note && (
                            <div>
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
                                    Note
                                </div>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 13,
                                        color: "#4A5568",
                                        lineHeight: 1.65,
                                    }}
                                >
                                    {contact.note}
                                </p>
                            </div>
                        )}
                    </DetailSection>
                )}
            </div>
        </aside>
    );
};

export default ContactDetailPanel;
