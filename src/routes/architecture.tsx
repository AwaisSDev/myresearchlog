import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/GlassCard";
import { format } from "date-fns";
import type { ArchitectureDecision } from "@/lib/db";

export const Route = createFileRoute("/architecture")({ component: Architecture });

function Architecture() {
  const { data, addDecision, updateDecision, deleteDecision } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const list = [...data.architecture].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">ADR</p>
          <h1 className="mt-1 font-display text-5xl tracking-tight">Architecture Log</h1>
          <p className="mt-2 text-sm text-muted-foreground">Track why every design choice was made.</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => { const d = addDecision({ title: "New Decision" }); }}
          className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-medium text-white shadow-glow">
          <Plus className="h-4 w-4" /> New decision
        </motion.button>
      </header>

      {list.length === 0 ? (
        <GlassCard className="py-16 text-center text-sm text-muted-foreground">No decisions logged yet.</GlassCard>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {list.map((d) => {
              const open = openId === d.id;
              return (
                <motion.div key={d.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass rounded-2xl">
                  <button onClick={() => setOpenId(open ? null : d.id)} className="flex w-full items-center gap-3 px-5 py-4 text-left">
                    <span className={`inline-flex h-6 items-center rounded-full px-2 text-[10px] font-medium uppercase tracking-wider ${
                      d.status === "accepted" ? "bg-emerald-500/15 text-emerald-700" :
                      d.status === "deprecated" ? "bg-rose-500/15 text-rose-700" :
                      "bg-amber-500/15 text-amber-700"
                    }`}>{d.status}</span>
                    <p className="flex-1 truncate font-medium">{d.title}</p>
                    <span className="text-[10px] text-muted-foreground">{format(d.createdAt, "MMM d, yyyy")}</span>
                    <motion.div animate={{ rotate: open ? 180 : 0 }}><ChevronDown className="h-4 w-4 text-muted-foreground" /></motion.div>
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }} className="overflow-hidden border-t border-border/60">
                        <div className="space-y-3 p-5">
                          <Field label="Title"><input value={d.title} onChange={(e) => updateDecision(d.id, { title: e.target.value })} className="input" /></Field>
                          <Field label="Status">
                            <select value={d.status} onChange={(e) => updateDecision(d.id, { status: e.target.value as ArchitectureDecision["status"] })} className="input">
                              <option value="proposed">proposed</option><option value="accepted">accepted</option><option value="deprecated">deprecated</option>
                            </select>
                          </Field>
                          <Field label="Context"><textarea rows={3} value={d.context} onChange={(e) => updateDecision(d.id, { context: e.target.value })} className="input" /></Field>
                          <Field label="Decision"><textarea rows={3} value={d.decision} onChange={(e) => updateDecision(d.id, { decision: e.target.value })} className="input" /></Field>
                          <Field label="Rationale (why)"><textarea rows={3} value={d.rationale} onChange={(e) => updateDecision(d.id, { rationale: e.target.value })} className="input" /></Field>
                          <Field label="Consequences"><textarea rows={3} value={d.consequences} onChange={(e) => updateDecision(d.id, { consequences: e.target.value })} className="input" /></Field>
                          <div className="flex justify-end">
                            <button onClick={() => deleteDecision(d.id)} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      <style>{`.input{width:100%;border-radius:0.5rem;border:1px solid var(--border);background:rgba(255,255,255,0.5);padding:0.5rem 0.75rem;font-size:0.875rem;outline:none;}
        .input:focus{border-color:var(--primary);}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>{children}</label>;
}
