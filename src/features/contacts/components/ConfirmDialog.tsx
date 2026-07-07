import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog = ({ title, message, onConfirm, onCancel }: ConfirmDialogProps) => {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(13,22,37,.3)",
                zIndex: 100,
                backdropFilter: "blur(2px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    background: "#FFFFFF",
                    borderRadius: 12,
                    width: 400,
                    padding: 24,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
            >
                <div style={{ display: "flex", gap: 16 }}>
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: "#FEF2F2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <AlertTriangle size={24} color="#DC2626" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0D1625" }}>
                            {title}
                        </h3>
                        <p
                            style={{
                                margin: "8px 0 16px",
                                fontSize: 13.5,
                                color: "#4A5568",
                                lineHeight: 1.5,
                            }}
                        >
                            {message}
                        </p>
                        <div
                            style={{
                                padding: "8px 12px",
                                background: "#FEF2F2",
                                borderRadius: 6,
                                border: "1px solid #FCA5A5",
                                marginBottom: 20,
                            }}
                        >
                            <span style={{ fontSize: 12, color: "#991B1B" }}>
                                Note: Any associated Activities, Visits, Drafts will also be Deleted.
                            </span>
                        </div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button
                                onClick={onCancel}
                                style={{
                                    padding: "8px 16px",
                                    background: "#FFFFFF",
                                    border: "1px solid #C4D5F1",
                                    borderRadius: 8,
                                    fontSize: 13.5,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    color: "#4A5568",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                style={{
                                    padding: "8px 16px",
                                    background: "#DC2626",
                                    border: "none",
                                    borderRadius: 8,
                                    fontSize: 13.5,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    color: "#FFFFFF",
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
