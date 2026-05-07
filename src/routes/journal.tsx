import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/GlassCard";
import { format } from "date-fns";

export const Route = createFileRoute("/journal")({ component: Journal });

function Journal() {
  const { data, upsertJournal } = useStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);
  const entry = data.journal.find((j) => j.date === date) ?? { mood: 3, productivity: 3, goals: "", challenge: "", insight: "" };
  const set = (patch: Partial<typeof entry>) => upsertJournal({ date, ...entry, ...patch });

  const past = [...data.journal].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Daily</p>
          <h1 className="mt-1 font-display text-5xl tracking-tight">Research Journal</h1>
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-border/60 bg-white/60 px-3 py-2 text-sm outline-none" />
      </header>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard>
          <div className="grid gap-6 md:grid-cols-2">
            <Slider label="Mood" value={entry.mood} onChange={(v) => set({ mood: v })} emojis={["😞", "😕", "😐", "🙂", "😄"]} />
            <Slider label="Productivity" value={entry.productivity} onChange={(v) => set({ productivity: v })} emojis={["🐌", "🚶", "🏃", "🚀", "⚡"]} />
          </div>
          <div className="mt-6 space-y-4">
            <Area label="Today's goals" value={entry.goals} onChange={(v) => set({ goals: v })} placeholder="What do you want to accomplish today?" />
            <Area label="Biggest challenge today" value={entry.challenge} onChange={(v) => set({ challenge: v })} placeholder="What blocked or frustrated you?" />
            <Area label="Key insight discovered" value={entry.insight} onChange={(v) => set({ insight: v })} placeholder="The one thing worth remembering." />
          </div>
        </GlassCard>
      </motion.div>

      {past.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-2xl tracking-tight">Past entries</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {past.slice(0, 8).map((j) => (
              <button key={j.id} onClick={() => setDate(j.date)} className="text-left">
                <GlassCard className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{format(new Date(j.date), "EEE · MMM d")}</p>
                  <p className="mt-1 line-clamp-2 text-sm">{j.insight || j.goals || "—"}</p>
                  <p className="mt-2 text-xs">Mood {"●".repeat(j.mood)}{"○".repeat(5 - j.mood)} · Prod {"●".repeat(j.productivity)}{"○".repeat(5 - j.productivity)}</p>
                </GlassCard>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Slider({ label, value, onChange, emojis }: { label: string; value: number; onChange: (v: number) => void; emojis: string[] }) {
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex items-center justify-between gap-2">
        {emojis.map((e, i) => (
          <button key={i} onClick={() => onChange(i + 1)}
            className={`flex-1 rounded-xl border py-3 text-2xl transition ${value === i + 1 ? "border-primary bg-primary/10 scale-110 shadow-glow" : "border-border/60 bg-white/40 hover:bg-white/70"}`}>
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-border/60 bg-white/50 px-3 py-2 text-sm outline-none focus:border-primary" />
    </label>
  );
}
