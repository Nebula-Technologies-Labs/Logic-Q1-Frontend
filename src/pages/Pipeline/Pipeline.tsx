import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import Layout from "../../components/layout/Layout";
import SlidePanel from "../../components/common/SlidePanel";
import { useLocalStorage } from "../../utils/storage";
import { addActivityEntry } from "../../utils/activity";

interface Deal {
 id: string; company: string; industry: string; value: number; stage: string; probability: number;
}

const defaultDeals: Deal[] = [];

const stageOrder = ["Discovery", "Proposal Sent", "Negotiation", "Closing", "Won"];
const stageColors: Record<string, string> = {
 "Discovery": "bg-surface-variant text-on-surface-variant",
 "Proposal Sent": "bg-secondary-container text-on-secondary-container",
 "Negotiation": "bg-primary-container text-on-primary-container",
 "Closing": "bg-tertiary-fixed text-tertiary",
 "Won": "bg-tertiary-container text-on-tertiary",
};

const bgClasses = [
 "bg-tertiary-fixed text-tertiary",
 "bg-surface-variant text-on-surface-variant",
 "bg-primary-fixed text-primary",
 "bg-primary-container text-on-primary-container",
];

function formatCurrency(n: number) {
 return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function getInitials(name: string): string {
 const parts = name.trim().split(/\s+/);
 return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0][0].toUpperCase();
}

const Pipeline = () => {
 const [searchQuery, setSearchQuery] = useState("");
 const [deals, setDeals] = useLocalStorage<Deal[]>("pipeline_deals", defaultDeals);

 const [formOpen, setFormOpen] = useState(false);
 const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
 const [company, setCompany] = useState("");
 const [industry, setIndustry] = useState("");
 const [value, setValue] = useState("");
 const [stage, setStage] = useState("Discovery");
 const [probability, setProbability] = useState("50");

 const dealsByStage: Record<string, Deal[]> = {};
 stageOrder.forEach((s) => { dealsByStage[s] = deals.filter((d) => d.stage === s); });

 const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
 const totalDeals = deals.length;

 const openAdd = () => {
  setEditingDeal(null); setCompany(""); setIndustry(""); setValue(""); setStage("Discovery"); setProbability("50"); setFormOpen(true);
 };

 const openEdit = (deal: Deal) => {
  setEditingDeal(deal); setCompany(deal.company); setIndustry(deal.industry);
  setValue(String(deal.value)); setStage(deal.stage); setProbability(String(deal.probability)); setFormOpen(true);
 };

 const handleSave = () => {
  if (!company.trim() || !value.trim()) return;
  const numValue = parseInt(value) || 0;
  const numProb = parseInt(probability) || 0;
  if (editingDeal) {
 const oldStage = editingDeal.stage;
 setDeals((prev) => prev.map((d) => d.id === editingDeal.id
  ? { ...d, company, industry, value: numValue, stage, probability: numProb }
  : d
 ));
 if (stage === "Won" && oldStage !== "Won") {
  addActivityEntry(`Deal Won: ${company}`, `Closed at ${formatCurrency(numValue)}`, "deal");
 } else {
  addActivityEntry(`Deal Updated: ${company}`, `Moved to ${stage} · ${formatCurrency(numValue)}`, "deal");
 }
  } else {
 const newDeal: Deal = { id: String(Date.now()), company, industry, value: numValue, stage, probability: numProb };
 setDeals((prev) => [...prev, newDeal]);
 addActivityEntry(`Deal Created: ${company}`, `${stage} · ${formatCurrency(numValue)}`, "deal");
  }
  setFormOpen(false);
 };

 const handleStageChange = (deal: Deal, newStage: string) => {
  setDeals((prev) => prev.map((d) => d.id === deal.id ? { ...d, stage: newStage } : d));
  if (newStage === "Won") {
 addActivityEntry(`Deal Won: ${deal.company}`, `Closed at ${formatCurrency(deal.value)}`, "deal");
  } else {
 addActivityEntry(`Deal Updated: ${deal.company}`, `Moved to ${newStage} · ${formatCurrency(deal.value)}`, "deal");
  }
 };

 return (
  <Layout searchValue={searchQuery} onSearch={setSearchQuery} onAddNew={openAdd}>
 <div className="p-6 max-w-[1440px] mx-auto space-y-6">
  <div className="flex justify-between items-end">
   <div>
  <h2 className="text-headline-lg font-headline-lg text-on-surface">Deals Pipeline</h2>
  <p className="text-body-lg text-on-surface-variant mt-1">{totalDeals} deals · {formatCurrency(totalValue)} total value</p>
   </div>
   <div className="flex gap-4">
  <button className="px-4 py-2 border border-outline-variant text-body-md font-medium hover:bg-surface-container transition-colors flex items-center gap-2">
   <Filter size={16} /> Filter
  </button>
  <button onClick={openAdd} className="px-4 py-2 bg-primary text-on-primary text-body-md font-medium hover:opacity-90 transition-all flex items-center gap-2">
   <Plus size={18} /> Add Deal
  </button>
   </div>
  </div>

  <div className="flex gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: "thin" }}>
   {stageOrder.map((stg) => {
  const stageDeals = dealsByStage[stg] || [];
  const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0);
  return (
   <div key={stg} className="kanban-column flex-shrink-0 w-80 bg-surface-container-low border border-outline-variant">
    <div className="p-6 border-b border-outline-variant">
   <div className="flex items-center justify-between">
    <h3 className="text-sm font-bold text-on-surface">{stg}</h3>
    <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 ">{stageDeals.length}</span>
   </div>
   <p className="text-xs text-on-surface-variant mt-1">{formatCurrency(stageTotal)}</p>
    </div>
    <div className="p-4 space-y-4 min-h-[200px]">
   {stageDeals.map((deal) => {
    const initials = getInitials(deal.company);
    const bgClass = bgClasses[deal.company.length % bgClasses.length];
    return (
     <div key={deal.id} onClick={() => openEdit(deal)} className="bg-surface-container-lowest border border-outline-variant p-6 deal-card-hover cursor-pointer transition-all">
    <div className="flex items-center gap-4 mb-4">
     <div className={`w-10 h-10 ${bgClass} flex items-center justify-center font-bold text-sm`}>
      {initials}
     </div>
     <div>
      <p className="text-sm font-bold text-on-surface">{deal.company}</p>
      <p className="text-xs text-on-surface-variant">{deal.industry}</p>
     </div>
    </div>
    <div className="flex items-center justify-between mb-4">
     <span className="text-sm font-bold text-on-surface">{formatCurrency(deal.value)}</span>
     <span className={`text-[11px] font-bold px-2 py-0.5 ${stageColors[deal.stage] || "bg-surface-variant text-on-surface-variant"}`}>
      {deal.stage}
     </span>
    </div>
    <div>
     <div className="flex justify-between items-center mb-1">
      <span className="text-xs text-on-surface-variant">Win Probability</span>
      <span className="text-xs text-on-surface-variant">{deal.probability}%</span>
     </div>
     <div className="w-full bg-surface-container-high h-1.5 overflow-hidden">
      <div className="bg-primary h-full " style={{ width: `${deal.probability}%` }} />
     </div>
    </div>
    <div className="flex gap-2 mt-4 pt-4 border-t border-outline-variant">
     {stageOrder.indexOf(deal.stage) > 0 && (
      <button onClick={(e) => { e.stopPropagation(); handleStageChange(deal, stageOrder[stageOrder.indexOf(deal.stage) - 1]); }}
     className="text-xs text-on-surface-variant hover:text-on-surface px-2 py-1 rounded hover:bg-surface-container transition-colors">← Move Back</button>
     )}
     {stageOrder.indexOf(deal.stage) < stageOrder.length - 1 && (
      <button onClick={(e) => { e.stopPropagation(); handleStageChange(deal, stageOrder[stageOrder.indexOf(deal.stage) + 1]); }}
     className="text-xs text-primary hover:text-primary-container px-2 py-1 rounded hover:bg-surface-container transition-colors ml-auto">Move Forward →</button>
     )}
    </div>
     </div>
    );
   })}
   {stageDeals.length === 0 && (
    <div className="text-center py-8">
     <p className="text-xs text-on-surface-variant">No deals in {stg}</p>
    </div>
   )}
    </div>
   </div>
  );
   })}
  </div>
 </div>

 <SlidePanel open={formOpen} onClose={() => setFormOpen(false)} title={editingDeal ? "Edit Deal" : "Add New Deal"}>
  <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
   <div className="flex flex-col gap-1">
  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Company Name</label>
  <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
   className="w-full px-4 py-2 border border-outline-variant text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required />
   </div>
   <div className="flex flex-col gap-1">
  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Industry</label>
  <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
   className="w-full px-4 py-2 border border-outline-variant text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
   </div>
   <div className="grid grid-cols-2 gap-4">
  <div className="flex flex-col gap-1">
   <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Value ($)</label>
   <input type="number" value={value} onChange={(e) => setValue(e.target.value)}
    className="w-full px-4 py-2 border border-outline-variant text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required />
  </div>
  <div className="flex flex-col gap-1">
   <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Probability (%)</label>
   <input type="number" min="0" max="100" value={probability} onChange={(e) => setProbability(e.target.value)}
    className="w-full px-4 py-2 border border-outline-variant text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
  </div>
   </div>
   <div className="flex flex-col gap-1">
  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Stage</label>
  <select value={stage} onChange={(e) => setStage(e.target.value)}
   className="w-full px-4 py-2 border border-outline-variant text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
   {stageOrder.map((s) => (<option key={s} value={s}>{s}</option>))}
  </select>
   </div>
   <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant">
  <button type="button" onClick={() => setFormOpen(false)}
   className="px-4 py-2 text-body-md font-medium text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors">Cancel</button>
  <button type="submit"
   className="px-4 py-2 text-body-md font-medium text-on-primary bg-primary hover:opacity-90 transition-all shadow-sm">{editingDeal ? "Update" : "Save"}</button>
   </div>
  </form>
 </SlidePanel>
  </Layout>
 );
};

export default Pipeline;

