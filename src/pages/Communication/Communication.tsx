import { useState, useMemo, useRef } from "react";
import { Mail, Plus, Inbox, Send, ArrowLeft, Trash2, Search, User, Clock, Paperclip, AlertCircle, Image, FileText, X, Download, Eye } from "lucide-react";
import Layout from "../../components/layout/Layout";
import SlidePanel from "../../components/common/SlidePanel";
import { useLocalStorage } from "../../utils/storage";

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string;
}

interface EmailAddress {
  id: string;
  address: string;
}

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  emails: EmailAddress[];
}

interface EmailMessage {
  id: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  subject: string;
  body: string;
  date: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  deleted: boolean;
  attachments: Attachment[];
}

type View = "inbox" | "detail" | "sent";

const Communication = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<View>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");

  const [persons] = useLocalStorage<Person[]>("contacts_persons", []);
  const [emails, setEmails] = useLocalStorage<EmailMessage[]>("communication_messages", []);

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeError, setComposeError] = useState("");
  const [composeAttachments, setComposeAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contactEmails = useMemo(() => {
    const map = new Map<string, string>();
    persons.forEach((p) => {
      p.emails.forEach((e) => {
        map.set(e.address.toLowerCase(), `${p.firstName} ${p.lastName}`);
      });
    });
    return map;
  }, [persons]);

  const filteredEmails = useMemo(() => {
    let list = emails.filter((e) => !e.deleted);
    if (activeTab === "inbox") list = list.filter((e) => e.to === "me" || e.to === "Me");
    else list = list.filter((e) => e.from === "me" || e.from === "Me");
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) =>
        e.subject.toLowerCase().includes(q) ||
        e.fromName.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [emails, activeTab, searchQuery]);

  const unreadCount = emails.filter((e) => !e.read && e.to === "me").length;

  const handleCompose = () => {
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setComposeError("");
    setComposeAttachments([]);
    setComposeOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result as string;
        setComposeAttachments((prev) => [
          ...prev,
          { id: String(Date.now()) + Math.random(), name: file.name, type: file.type, size: file.size, data },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setComposeAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (type: string) => type.startsWith("image/");

  const handleSend = () => {
    const targetEmail = composeTo.trim().toLowerCase();
    if (!targetEmail) { setComposeError("Recipient email is required"); return; }
    if (!composeSubject.trim()) { setComposeError("Subject is required"); return; }

    const contactName = contactEmails.get(targetEmail);
    if (!contactName) {
      setComposeError(`"${targetEmail}" was not found in your contacts. Please check the address and try again.`);
      return;
    }

    const now = new Date();
    const timeLabel = now.toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });

    const newEmail: EmailMessage = {
      id: String(Date.now()),
      from: "me",
      fromName: "You",
      to: targetEmail,
      toName: contactName,
      subject: composeSubject.trim(),
      body: composeBody.trim(),
      date: timeLabel,
      timestamp: now.toISOString(),
      read: true,
      starred: false,
      deleted: false,
      attachments: composeAttachments,
    };

    setEmails((prev) => [newEmail, ...prev]);
    setComposeOpen(false);
    setActiveTab("sent");
  };

  const openEmail = (email: EmailMessage) => {
    setSelectedEmail(email);
    setView("detail");
    if (!email.read && email.to === "me") {
      setEmails((prev) => prev.map((e) => e.id === email.id ? { ...e, read: true } : e));
    }
  };

  const deleteEmail = (id: string) => {
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, deleted: true } : e));
    setView("inbox");
    setSelectedEmail(null);
  };

  const formatFullDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString("en-US", {
      weekday: "short", month: "long", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  };

  const renderInbox = () => (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
      {filteredEmails.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">
          <div className="w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox size={28} className="text-outline" />
          </div>
          <p className="text-sm font-medium text-on-surface mb-1">
            {activeTab === "inbox" ? "No incoming emails" : "No sent emails"}
          </p>
          <p className="text-sm">Compose a message to get started.</p>
        </div>
      ) : (
        <div className="divide-y divide-outline-variant">
          {filteredEmails.map((email) => (
            <button
              key={email.id}
              onClick={() => openEmail(email)}
              className={`w-full text-left flex items-start gap-4 px-6 py-5 hover:bg-surface-container-low transition-colors ${
                !email.read ? "bg-surface-container-low/50" : ""
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                email.from === "me"
                  ? "bg-primary-fixed text-primary"
                  : "bg-tertiary-fixed text-tertiary"
              }`}>
                {email.from === "me"
                  ? email.toName.charAt(0).toUpperCase()
                  : email.fromName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <p className={`text-sm truncate ${!email.read ? "font-bold text-on-surface" : "text-on-surface"}`}>
                    {email.from === "me" ? email.toName : email.fromName}
                  </p>
                  <span className="text-xs text-outline whitespace-nowrap shrink-0">{email.date}</span>
                </div>
                <p className={`text-sm mt-0.5 truncate ${!email.read ? "font-semibold text-on-surface" : "text-on-surface"}`}>
                  {email.subject}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5 truncate">
                  {email.from === "me" ? `To: ${email.to}` : email.body}
                </p>
              </div>
              {!email.read && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderDetail = () => {
    if (!selectedEmail) return null;
    const isFromMe = selectedEmail.from === "me";
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
          <button
            onClick={() => { setView("inbox"); setSelectedEmail(null); }}
            className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            onClick={() => deleteEmail(selectedEmail.id)}
            className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-error transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-title-md font-title-md text-on-surface mb-4">{selectedEmail.subject}</h2>

          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
              isFromMe ? "bg-primary-fixed text-primary" : "bg-tertiary-fixed text-tertiary"
            }`}>
              {isFromMe
                ? selectedEmail.toName.charAt(0).toUpperCase()
                : selectedEmail.fromName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    {isFromMe ? selectedEmail.toName : selectedEmail.fromName}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {isFromMe ? `to ${selectedEmail.to}` : `from ${selectedEmail.from}`}
                  </p>
                </div>
                <span className="text-xs text-outline whitespace-nowrap">
                  {formatFullDate(selectedEmail.timestamp)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant pt-6">
            <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
              {selectedEmail.body || "(No message content)"}
            </p>

            {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
              <div className="mt-6 pt-6 border-t border-outline-variant">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                  Attachments ({selectedEmail.attachments.length})
                </p>
                <div className="space-y-2">
                  {selectedEmail.attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-3 px-4 py-3 bg-surface-container rounded-lg">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isImage(att.type) ? "bg-primary-fixed" : "bg-surface-variant"
                      }`}>
                        {isImage(att.type)
                          ? <Image size={16} className="text-primary" />
                          : <FileText size={16} className="text-on-surface-variant" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-on-surface truncate">{att.name}</p>
                        <p className="text-xs text-on-surface-variant">{formatFileSize(att.size)}</p>
                      </div>
                      <a
                        href={att.data}
                        download={att.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  ))}
                </div>
                {selectedEmail.attachments.filter((a) => isImage(a.type)).length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {selectedEmail.attachments.filter((a) => isImage(a.type)).map((att) => (
                      <a
                        key={att.id}
                        href={att.data}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-video rounded-lg overflow-hidden border border-outline-variant bg-surface-container hover:opacity-90 transition-opacity"
                      >
                        <img src={att.data} alt={att.name} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout searchValue={searchQuery} onSearch={setSearchQuery} onAddNew={handleCompose}>
      <div className="p-6 max-w-[1440px] mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface">Communication Hub</h2>
            <p className="text-body-lg text-on-surface-variant mt-1">
              {filteredEmails.length} email{filteredEmails.length !== 1 ? "s" : ""}
              {unreadCount > 0 && ` · ${unreadCount} unread`}
            </p>
          </div>
          <button
            onClick={handleCompose}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-medium hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Compose
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab("inbox"); setView("inbox"); }}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === "inbox"
                ? "bg-primary-container text-on-primary-container font-bold"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <Inbox size={16} /> Inbox
            {unreadCount > 0 && (
              <span className="text-[10px] bg-primary text-on-primary px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab("sent"); setView("inbox"); }}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === "sent"
                ? "bg-primary-container text-on-primary-container font-bold"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <Send size={16} /> Sent
          </button>
        </div>

        {view === "inbox" && renderInbox()}
        {view === "detail" && renderDetail()}
      </div>

      <SlidePanel open={composeOpen} onClose={() => setComposeOpen(false)} title="New Message">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="p-6 space-y-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">To</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type="email"
                value={composeTo}
                onChange={(e) => { setComposeTo(e.target.value); setComposeError(""); }}
                placeholder="Enter contact email address..."
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 transition-all ${
                  composeError
                    ? "border-error focus:border-error focus:ring-error/20"
                    : "border-outline-variant focus:border-primary focus:ring-primary/20"
                }`}
                required
              />
            </div>
            {composeError && (
              <div className="flex items-start gap-2 mt-1.5 px-3 py-2 bg-error-container border border-error/20 rounded-lg">
                <AlertCircle size={14} className="text-error shrink-0 mt-0.5" />
                <p className="text-xs text-error">{composeError}</p>
              </div>
            )}
            <p className="text-xs text-on-surface-variant mt-1">
              Recipient must exist in your contacts
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Subject</label>
            <input
              type="text"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              placeholder="What's this about?"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Message</label>
            <textarea
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              rows={10}
              placeholder="Write your message..."
              className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          {composeAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {composeAttachments.map((att) => (
                <div key={att.id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant">
                  {isImage(att.type)
                    ? <Image size={14} className="text-primary" />
                    : <FileText size={14} className="text-on-surface-variant" />
                  }
                  <span className="text-xs text-on-surface truncate max-w-[120px]">{att.name}</span>
                  <span className="text-[10px] text-on-surface-variant">{formatFileSize(att.size)}</span>
                  <button type="button" onClick={() => removeAttachment(att.id)}
                    className="p-0.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <Paperclip size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setComposeOpen(false)}
                className="px-4 py-2 text-body-md font-medium text-on-surface bg-surface-container hover:bg-surface-container-high rounded-lg transition-colors"
              >
                Discard
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-body-md font-medium text-on-primary bg-primary hover:opacity-90 rounded-lg transition-all shadow-sm flex items-center gap-2"
              >
                <Send size={16} /> Send
              </button>
            </div>
          </div>
        </form>
      </SlidePanel>
    </Layout>
  );
};

export default Communication;
