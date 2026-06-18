import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Building2, MessageSquare } from "lucide-react";
import Layout from "../../components/layout/Layout";
import { useLocalStorage } from "../../utils/storage";

interface Person {
 id: string; firstName: string; lastName: string; organization: string;
 phones: { id: string; number: string; type: "work" | "personal" }[];
 emails: { id: string; address: string; type: "work" | "personal" }[];
 label: string; owner: string; visibleTo: "everyone" | "only_me" | "team"; status: string;
}

interface TimelineEvent { id: string; personName: string; action: string; detail: string; timestamp: string; }

const activityIcons: Record<string, typeof Mail> = { Updated: Mail, Added: Building2, Deleted: MessageSquare };

const ContactDetail = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const [persons] = useLocalStorage<Person[]>("contacts_persons", []);
 const [timeline] = useLocalStorage<TimelineEvent[]>("contacts_timeline", []);
 const person = persons.find((p) => p.id === id);

 if (!person) {
  return (
 <Layout searchValue="" onSearch={() => {}}>
  <div className="p-6 max-w-[1440px] mx-auto">
   <div className="text-center py-20 text-on-surface-variant">
  <p className="text-headline-md font-headline-md">Contact not found</p>
  <button onClick={() => navigate("/contacts")} className="mt-4 text-primary hover:underline">Back to Contacts</button>
   </div>
  </div>
 </Layout>
  );
 }

 const personName = `${person.firstName} ${person.lastName}`;
 const personTimeline = timeline.filter((e) => e.personName === personName).slice(0, 10);

 return (
  <Layout searchValue="" onSearch={() => {}} onAddNew={() => {}}>
 <div className="p-6 max-w-[1440px] mx-auto space-y-6">
  <button onClick={() => navigate("/contacts")} className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
   <ArrowLeft size={16} /> Back to Contacts
  </button>

  <div className="bg-surface-container-lowest border border-outline-variant overflow-hidden">
   <div className="h-24 bg-gradient-to-r from-primary to-primary-container" />
   <div className="px-6 pb-6 -mt-12">
  <div className="flex items-end gap-6">
   <div className="w-24 h-24 bg-surface-container-lowest border-4 border-surface-container-lowest flex items-center justify-center text-3xl font-bold text-primary shadow-md">
    {person.firstName[0]}{person.lastName[0]}
   </div>
   <div className="flex-1 pb-1">
    <div className="flex items-center justify-between">
   <div>
    <h1 className="text-headline-md font-headline-md text-on-surface">{person.firstName} {person.lastName}</h1>
    <p className="text-body-md text-on-surface-variant">{person.organization || "No organization"}</p>
   </div>
   <span className={`px-md py-1 text-xs font-bold ${
    person.status === "Active" ? "bg-primary-container/20 text-primary" :
    person.status === "Pending" ? "bg-tertiary-fixed text-tertiary" :
    "bg-surface-variant text-on-surface-variant"
   }`}>{person.status}</span>
    </div>
   </div>
  </div>
   </div>

   <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2 space-y-6">
   <div className="border border-outline-variant p-6">
    <h3 className="text-title-md font-title-md text-on-surface mb-4">Activity Timeline</h3>
    <div className="space-y-4">
   {personTimeline.length === 0 ? (
    <p className="text-sm text-on-surface-variant text-center py-4">No activity recorded for this contact.</p>
   ) : personTimeline.map((event) => {
    const Icon = activityIcons[event.action] || MessageSquare;
    return (
     <div key={event.id} className="flex gap-4">
    <div className="w-8 h-8 bg-surface-container flex items-center justify-center shrink-0">
     <Icon size={16} className="text-on-surface-variant" />
    </div>
    <div className="flex-1">
     <p className="text-sm text-on-surface"><span className="font-bold">{event.action}</span> — {event.detail}</p>
     <span className="text-xs text-outline">{event.timestamp}</span>
    </div>
     </div>
    );
   })}
    </div>
   </div>
  </div>

  <div className="space-y-6">
   <div className="border border-outline-variant p-6 space-y-4">
    <h3 className="text-title-md font-title-md text-on-surface">Contact Info</h3>
    <div className="space-y-4">
   {person.emails.map((e) => (
    <div key={e.id} className="flex items-center gap-4">
     <Mail size={16} className="text-on-surface-variant" />
     <div>
    <p className="text-sm text-on-surface">{e.address}</p>
    <span className="text-xs text-on-surface-variant capitalize">{e.type}</span>
     </div>
    </div>
   ))}
   {person.phones.map((p) => (
    <div key={p.id} className="flex items-center gap-4">
     <Phone size={16} className="text-on-surface-variant" />
     <div>
    <p className="text-sm text-on-surface">{p.number}</p>
    <span className="text-xs text-on-surface-variant capitalize">{p.type}</span>
     </div>
    </div>
   ))}
   {person.organization && (
    <div className="flex items-center gap-4">
     <Building2 size={16} className="text-on-surface-variant" />
     <p className="text-sm text-on-surface">{person.organization}</p>
    </div>
   )}
    </div>
   </div>

   <div className="border border-outline-variant p-6 space-y-4">
    <h3 className="text-title-md font-title-md text-on-surface">Details</h3>
    <div className="space-y-4">
    <div className="flex items-center justify-between">
    <span className="text-sm text-on-surface-variant">Owner</span>
    <span className="text-sm font-bold text-on-surface">{person.owner || "—"}</span>
   </div>
   <div className="flex items-center justify-between">
    <span className="text-sm text-on-surface-variant">Visibility</span>
     <span className="text-sm font-bold text-on-surface capitalize">{person.visibleTo?.replace("_", " ") || "-"}</span>
   </div>
    </div>
   </div>
  </div>
   </div>
  </div>
 </div>
  </Layout>
 );
};

export default ContactDetail;

