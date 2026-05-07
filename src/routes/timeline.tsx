import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Plus, Trash2, Star, AlertTriangle, Flag, FileText } from "lucide-react";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/GlassCard";
import { format } from "date-fns";
import type { TimelineEvent } from "@/lib/db";

export const Route = createFileRoute("/timeline")({ component: Timeline });

const types: { value: TimelineEvent["type"]; label: string; icon: any; color: string }[] = [
  { value: "milestone", label: "Milestone", icon: Flag, color: "text-violet-600 bg-violet-500/15" },
  { value: "breakthrough", label: "Breakthrough", icon: Star, color: "text-emerald-600 bg-emerald-500/15" },
  { value: "failure", label: "Failure", icon: AlertTriangle, color: "text-rose-600 bg-rose-500/15" },
  { value: "note", label: "Note", icon: FileText, color: "text-slate-600 bg-slate-500/15" },
];

function Timeline() {
  const { data, addTimelineEvent, deleteTimelineEvent } = useStore();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState<TimelineEvent["type"]>("milestone");
  const events = [...data.timeline].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Project Story</p>
        <h1 className="mt-1 font-display text-5xl tracking-tight">Research Timeline</h1>
      </header>

      <GlassCard className="mb-6">
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title…"
            className="w-full rounded-lg border border-border/60 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Details (optional)…" rows={2}
            className="w-full rounded-lg border border-border/60 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <div className="flex flex-wrap items-center gap-2">
            {types.map((t) => {
              const Icon = t.icon; const active = type === t.value;
              return (
                <button key={t.value} onClick={() => setType(t.value)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${active ? "gradient-primary text-white shadow-glow" : "bg-white/50 text-muted-foreground hover:text-foreground"}`}>
                  <Icon className="h-3 w-3" />{t.label}
                </button>
              );
            })}
            <motion.button whileTap={{ scale: 0.96 }}
              disabled={!title.trim()}
              onClick={() => { addTimelineEvent({ title, description: desc, type }); setTitle(""); setDesc(""); }}
              className="ml-auto flex items-center gap-1 rounded-lg gradient-primary px-4 py-2 text-xs font-medium text-white shadow-glow disabled:opacity-50">
              <Plus className="h-3.5 w-3.5" /> Add event
            </motion.button>
          </div>
        </div>
      </GlassCard>

      {events.length === 0 ? (
        <GlassCard className="py-16 text-center text-sm text-muted-foreground">No events yet. Log your first milestone.</GlassCard>
      ) : (
        <ol className="relative space-y-5 border-l-2 border-border/50 pl-8">
          {events.map((ev, i) => {
            const meta = types.find((t) => t.value === ev.type)!;
            const Icon = meta.icon;
            return (
              <motion.li key={ev.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="relative"
              >
                <span className={`absolute -left-[42px] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-background ${meta.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <GlassCard hover={false} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{format(ev.createdAt, "EEE · MMM d, yyyy · HH:mm")}</p>
                      <h3 className="mt-1 font-medium">{ev.title}</h3>
                      {ev.description && <p className="mt-1 text-sm text-muted-foreground">{ev.description}</p>}
                    </div>
                    <button onClick={() => deleteTimelineEvent(ev.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </GlassCard>
              </motion.li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
