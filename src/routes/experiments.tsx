import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2, Tag, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/GlassCard";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Experiment } from "@/lib/db";

export const Route = createFileRoute("/experiments")({ component: Experiments });

const statuses: Experiment["status"][] = ["draft", "running", "success", "failed"];

function Experiments() {
  const { data, addExperiment, updateExperiment, deleteExperiment } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return data.experiments
      .filter((e) => filter === "all" || e.status === filter)
      .filter((e) => !q || (e.name + e.hypothesis + e.notes + e.tags.join(",")).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [data.experiments, q, filter]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Lab</p>
          <h1 className="mt-1 font-display text-5xl tracking-tight">Experiments</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => { const e = addExperiment({ name: "New Experiment" }); setOpenId(e.id); toast.success("Experiment created"); }}
          className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-medium text-white shadow-glow"
        >
          <Plus className="h-4 w-4" /> New experiment
        </motion.button>
      </header>

      <GlassCard className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search experiments, tags, hypotheses…"
            className="w-full rounded-lg border border-border/60 bg-white/50 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...statuses] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs capitalize transition ${
                filter === s ? "gradient-primary text-white shadow-glow" : "bg-white/50 text-muted-foreground hover:text-foreground"
              }`}>{s}</button>
          ))}
        </div>
      </GlassCard>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 && (
            <GlassCard className="py-16 text-center text-sm text-muted-foreground">
              No experiments match. Create one to begin.
            </GlassCard>
          )}
          {filtered.map((e) => {
            const open = openId === e.id;
            return (
              <motion.div key={e.id}
                layout
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-2xl"
              >
                <button onClick={() => setOpenId(open ? null : e.id)} className="flex w-full items-center gap-3 px-5 py-4 text-left">
                  <StatusBadge status={e.status} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{e.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.hypothesis || "No hypothesis yet"}</p>
                  </div>
                  <div className="hidden items-center gap-3 text-[10px] text-muted-foreground md:flex">
                    {e.metrics.accuracy != null && <span>acc {e.metrics.accuracy}%</span>}
                    {e.metrics.latency != null && <span>{e.metrics.latency}ms</span>}
                    <span>{format(e.createdAt, "MMM d")}</span>
                  </div>
                  <motion.div animate={{ rotate: open ? 180 : 0 }}><ChevronDown className="h-4 w-4 text-muted-foreground" /></motion.div>
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden border-t border-border/60"
                    >
                      <div className="space-y-3 p-5">
                        <Field label="Name">
                          <input value={e.name} onChange={(ev) => updateExperiment(e.id, { name: ev.target.value })}
                            className="w-full rounded-lg border border-border/60 bg-white/50 px-3 py-2 text-sm outline-none focus:border-primary" />
                        </Field>
                        <div className="grid gap-3 md:grid-cols-2">
                          <Field label="Status">
                            <select value={e.status} onChange={(ev) => updateExperiment(e.id, { status: ev.target.value as any })}
                              className="w-full rounded-lg border border-border/60 bg-white/50 px-3 py-2 text-sm outline-none focus:border-primary">
                              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </Field>
                          <Field label="Tags (comma separated)">
                            <input value={e.tags.join(", ")} onChange={(ev) => updateExperiment(e.id, { tags: ev.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                              className="w-full rounded-lg border border-border/60 bg-white/50 px-3 py-2 text-sm outline-none focus:border-primary" />
                          </Field>
                        </div>
                        <Field label="Hypothesis">
                          <textarea rows={2} value={e.hypothesis} onChange={(ev) => updateExperiment(e.id, { hypothesis: ev.target.value })}
                            className="w-full rounded-lg border border-border/60 bg-white/50 px-3 py-2 text-sm outline-none focus:border-primary" />
                        </Field>
                        <Field label="Notes / log">
                          <textarea rows={5} value={e.notes} onChange={(ev) => updateExperiment(e.id, { notes: ev.target.value })}
                            className="w-full rounded-lg border border-border/60 bg-white/50 px-3 py-2 font-mono text-xs outline-none focus:border-primary" />
                        </Field>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {(["accuracy", "latency", "detectionDelay", "loss"] as const).map((k) => (
                            <Field key={k} label={k}>
                              <input type="number" value={e.metrics[k] ?? ""} onChange={(ev) => updateExperiment(e.id, {
                                metrics: { ...e.metrics, [k]: ev.target.value === "" ? undefined : Number(ev.target.value) }
                              })} className="w-full rounded-lg border border-border/60 bg-white/50 px-3 py-2 text-sm outline-none focus:border-primary" />
                            </Field>
                          ))}
                        </div>
                        {e.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {e.tags.map((t) => (
                              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                                <Tag className="h-2.5 w-2.5" />{t}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-end">
                          <button onClick={() => { deleteExperiment(e.id); toast.success("Deleted"); }}
                            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10">
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
    </div>
  );
}

function StatusBadge({ status }: { status: Experiment["status"] }) {
  const map = {
    success: "bg-emerald-500/15 text-emerald-700",
    running: "bg-blue-500/15 text-blue-700",
    failed: "bg-rose-500/15 text-rose-700",
    draft: "bg-slate-500/15 text-slate-700",
  } as const;
  return <span className={`inline-flex h-6 items-center rounded-full px-2 text-[10px] font-medium uppercase tracking-wider ${map[status]}`}>{status}</span>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
