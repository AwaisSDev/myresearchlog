import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { Printer, Download, Upload, ArrowLeft, FileJson } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/export")({ component: ExportPage });

function ExportPage() {
  const { data, exportJSON, importJSON } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const exps = [...data.experiments].sort((a, b) => a.createdAt - b.createdAt);
  const events = [...data.timeline].sort((a, b) => a.createdAt - b.createdAt);
  const journal = [...data.journal].sort((a, b) => a.date.localeCompare(b.date));
  const arch = [...data.architecture].sort((a, b) => a.createdAt - b.createdAt);
  const breakthroughs = events.filter((e) => e.type === "breakthrough");
  const failures = events.filter((e) => e.type === "failure");

  const trend = exps.map((e, i) => ({
    idx: i + 1,
    accuracy: e.metrics.accuracy ?? null,
    latency: e.metrics.latency ?? null,
  }));

  const downloadJSON = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${data.meta.projectName.replace(/\s+/g, "-")}-backup.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => { importJSON(String(reader.result)); toast.success("Backup imported"); };
    reader.readAsText(file);
  };

  // TOC sections with computed page numbers
  const toc = [
    { title: "Project Overview", page: 3 },
    { title: "Research Timeline", page: 4 },
    { title: "Experiment History", page: 5 },
    { title: "Performance Analytics", page: 5 + Math.max(1, Math.ceil(exps.length / 2)) },
    { title: "Architecture Decisions", page: 6 + Math.max(1, Math.ceil(exps.length / 2)) },
    { title: "Failure Logs", page: 7 + Math.max(1, Math.ceil(exps.length / 2)) + Math.ceil(arch.length / 2) },
    { title: "Daily Journal", page: 8 + Math.max(1, Math.ceil(exps.length / 2)) + Math.ceil(arch.length / 2) },
    { title: "Conclusions", page: 9 + Math.max(1, Math.ceil(exps.length / 2)) + Math.ceil(arch.length / 2) + Math.ceil(journal.length / 3) },
  ];

  return (
    <div className="min-h-screen">
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-30 glass-strong border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-2 text-xs font-medium hover:bg-white">
              <Upload className="h-3.5 w-3.5" /> Import JSON
            </button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); }} />
            <button onClick={downloadJSON}
              className="flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-2 text-xs font-medium hover:bg-white">
              <FileJson className="h-3.5 w-3.5" /> Export JSON
            </button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg gradient-primary px-4 py-2 text-xs font-medium text-white shadow-glow">
              <Printer className="h-3.5 w-3.5" /> Print / Save as PDF
            </motion.button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-3 text-[11px] text-muted-foreground">
          Tip: in the print dialog, set destination to <strong>Save as PDF</strong>, paper size A4, margins <strong>Default</strong>, and enable <strong>Background graphics</strong>.
        </div>
      </div>

      {/* Print container — every direct child is a page */}
      <div id="print-root" className="mx-auto max-w-[210mm] bg-white px-0 py-8 text-[#111] print:py-0 print:max-w-none print:m-0">
        {/* Cover */}
        <NotebookPage cover>
          <div className="flex h-full flex-col">
            <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Research Notebook</div>
            <div className="mt-auto">
              <h1 className="font-display text-[64px] leading-[0.95] tracking-tight">{data.meta.projectName}</h1>
              <div className="mt-6 h-[2px] w-24 bg-gradient-to-r from-violet-600 to-blue-500" />
              <p className="mt-6 max-w-md text-sm leading-relaxed text-neutral-600">
                A complete record of experiments, milestones, architecture decisions, and daily insights compiled for review.
              </p>
              <div className="mt-12 grid grid-cols-3 gap-6 text-xs">
                <Stat label="Experiments" value={exps.length} />
                <Stat label="Milestones" value={events.length} />
                <Stat label="Decisions" value={arch.length} />
              </div>
              <div className="mt-12 flex justify-between text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                <span>Compiled {format(new Date(), "MMMM d, yyyy")}</span>
                <span>Research OS</span>
              </div>
            </div>
          </div>
        </NotebookPage>

        {/* Table of Contents */}
        <NotebookPage pageNum={2}>
          <SectionHeader kicker="Index" title="Table of Contents" />
          <ol className="mt-8 space-y-3">
            {toc.map((t, i) => (
              <li key={i} className="flex items-baseline gap-3 text-sm">
                <span className="font-mono text-[10px] text-neutral-500 w-6">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-medium">{t.title}</span>
                <span className="flex-1 border-b border-dotted border-neutral-300 translate-y-[-3px]" />
                <span className="font-mono text-xs text-neutral-500">p. {t.page}</span>
              </li>
            ))}
          </ol>
        </NotebookPage>

        {/* Overview */}
        <NotebookPage pageNum={3}>
          <SectionHeader kicker="01" title="Project Overview" />
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-neutral-500">Started</h3>
              <p className="mt-1 text-sm">{format(data.meta.createdAt, "MMMM d, yyyy")}</p>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider text-neutral-500">Status</h3>
              <p className="mt-1 text-sm">Active research</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-4 gap-4">
            <BigStat label="Experiments" value={exps.length} />
            <BigStat label="Successful" value={exps.filter((e) => e.status === "success").length} />
            <BigStat label="Breakthroughs" value={breakthroughs.length} />
            <BigStat label="Failures" value={failures.length} />
          </div>
          <div className="mt-10">
            <h3 className="text-xs uppercase tracking-wider text-neutral-500">Summary of recent activity</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {events.slice(-6).reverse().map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="font-mono text-[10px] text-neutral-500">{format(e.createdAt, "MMM d")}</span>
                  <span><strong className="capitalize">{e.type}:</strong> {e.title}</span>
                </li>
              ))}
              {events.length === 0 && <li className="text-neutral-500">No events recorded.</li>}
            </ul>
          </div>
        </NotebookPage>

        {/* Timeline */}
        <NotebookPage pageNum={4}>
          <SectionHeader kicker="02" title="Research Timeline" />
          {events.length === 0 ? (
            <p className="mt-6 text-sm text-neutral-500">No timeline events recorded.</p>
          ) : (
            <ol className="mt-6 space-y-4 border-l-2 border-neutral-300 pl-6">
              {events.map((e) => (
                <li key={e.id} className="print-avoid-break relative">
                  <span className="absolute -left-[31px] mt-1.5 h-3 w-3 rounded-full bg-neutral-900 ring-4 ring-white" />
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">{format(e.createdAt, "MMM d, yyyy · HH:mm")}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider ${
                      e.type === "breakthrough" ? "bg-emerald-100 text-emerald-800" :
                      e.type === "failure" ? "bg-rose-100 text-rose-800" :
                      e.type === "milestone" ? "bg-violet-100 text-violet-800" : "bg-neutral-100 text-neutral-700"
                    }`}>{e.type}</span>
                  </div>
                  <h4 className="mt-1 font-medium">{e.title}</h4>
                  {e.description && <p className="mt-0.5 text-sm text-neutral-600">{e.description}</p>}
                </li>
              ))}
            </ol>
          )}
        </NotebookPage>

        {/* Experiments — 2 per page */}
        {chunk(exps, 2).map((group, i) => (
          <NotebookPage key={`exp-${i}`} pageNum={5 + i}>
            {i === 0 && <SectionHeader kicker="03" title="Experiment History" />}
            <div className={`${i === 0 ? "mt-6" : ""} space-y-6`}>
              {group.map((e, idx) => (
                <article key={e.id} className="print-avoid-break border-t border-neutral-200 pt-5 first:border-t-0 first:pt-0">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-neutral-400">EXP-{String(exps.indexOf(e) + 1).padStart(3, "0")}</span>
                      <h3 className="font-display text-2xl tracking-tight">{e.name}</h3>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider ${
                      e.status === "success" ? "bg-emerald-100 text-emerald-800" :
                      e.status === "failed" ? "bg-rose-100 text-rose-800" :
                      e.status === "running" ? "bg-blue-100 text-blue-800" : "bg-neutral-100 text-neutral-700"
                    }`}>{e.status}</span>
                  </div>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-neutral-500">{format(e.createdAt, "MMM d, yyyy")}</p>
                  {e.hypothesis && (
                    <div className="mt-3"><p className="text-[10px] uppercase tracking-wider text-neutral-500">Hypothesis</p>
                      <p className="text-sm leading-relaxed">{e.hypothesis}</p></div>
                  )}
                  {Object.keys(e.metrics).length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-3">
                      {(["accuracy", "latency", "detectionDelay", "loss"] as const).map((k) => e.metrics[k] != null && (
                        <div key={k} className="rounded-lg border border-neutral-200 px-3 py-2">
                          <p className="text-[9px] uppercase tracking-wider text-neutral-500">{k}</p>
                          <p className="font-mono text-sm">{e.metrics[k]}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {e.notes && (
                    <div className="mt-3"><p className="text-[10px] uppercase tracking-wider text-neutral-500">Notes</p>
                      <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-700">{e.notes}</p></div>
                  )}
                  {e.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {e.tags.map((t) => <span key={t} className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-700">#{t}</span>)}
                    </div>
                  )}
                </article>
              ))}
              {group.length === 0 && <p className="text-sm text-neutral-500">No experiments recorded.</p>}
            </div>
          </NotebookPage>
        ))}
        {exps.length === 0 && (
          <NotebookPage pageNum={5}>
            <SectionHeader kicker="03" title="Experiment History" />
            <p className="mt-6 text-sm text-neutral-500">No experiments recorded.</p>
          </NotebookPage>
        )}

        {/* Analytics */}
        <NotebookPage>
          <SectionHeader kicker="04" title="Performance Analytics" />
          <div className="mt-6 space-y-8">
            <ChartBlock title="Accuracy progression" data={trend} dataKey="accuracy" color="#5b21b6" />
            <ChartBlock title="Latency progression (ms)" data={trend} dataKey="latency" color="#0369a1" />
          </div>
        </NotebookPage>

        {/* Architecture Decisions */}
        {chunk(arch, 2).map((group, i) => (
          <NotebookPage key={`arch-${i}`}>
            {i === 0 && <SectionHeader kicker="05" title="Architecture Decisions" />}
            <div className={`${i === 0 ? "mt-6" : ""} space-y-6`}>
              {group.map((d) => (
                <article key={d.id} className="print-avoid-break border-t border-neutral-200 pt-5 first:border-t-0 first:pt-0">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-xl tracking-tight">{d.title}</h3>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] uppercase tracking-wider text-neutral-700">{d.status}</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500">{format(d.createdAt, "MMM d, yyyy")}</p>
                  {d.context && <ADRField label="Context" value={d.context} />}
                  {d.decision && <ADRField label="Decision" value={d.decision} />}
                  {d.rationale && <ADRField label="Rationale" value={d.rationale} />}
                  {d.consequences && <ADRField label="Consequences" value={d.consequences} />}
                </article>
              ))}
            </div>
          </NotebookPage>
        ))}
        {arch.length === 0 && (
          <NotebookPage>
            <SectionHeader kicker="05" title="Architecture Decisions" />
            <p className="mt-6 text-sm text-neutral-500">No decisions recorded.</p>
          </NotebookPage>
        )}

        {/* Failure logs */}
        <NotebookPage>
          <SectionHeader kicker="06" title="Failure Logs" />
          {failures.length === 0 ? (
            <p className="mt-6 text-sm text-neutral-500">No failures logged. Either incredibly fortunate or under-reporting.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {failures.map((f) => (
                <li key={f.id} className="print-avoid-break rounded-lg border border-rose-200 bg-rose-50/40 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-rose-700">{format(f.createdAt, "MMM d, yyyy · HH:mm")}</p>
                  <h4 className="mt-1 font-medium">{f.title}</h4>
                  {f.description && <p className="mt-1 text-sm text-neutral-700">{f.description}</p>}
                </li>
              ))}
            </ul>
          )}
        </NotebookPage>

        {/* Journal — 3 per page */}
        {chunk(journal, 3).map((group, i) => (
          <NotebookPage key={`j-${i}`}>
            {i === 0 && <SectionHeader kicker="07" title="Daily Journal" />}
            <div className={`${i === 0 ? "mt-6" : ""} space-y-5`}>
              {group.map((j) => (
                <article key={j.id} className="print-avoid-break border-t border-neutral-200 pt-4 first:border-t-0 first:pt-0">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-medium">{format(new Date(j.date), "EEEE · MMMM d, yyyy")}</h3>
                    <span className="font-mono text-[10px] text-neutral-500">Mood {j.mood}/5 · Productivity {j.productivity}/5</span>
                  </div>
                  {j.goals && <p className="mt-2 text-sm"><strong className="text-neutral-500">Goals: </strong>{j.goals}</p>}
                  {j.challenge && <p className="mt-1 text-sm"><strong className="text-neutral-500">Challenge: </strong>{j.challenge}</p>}
                  {j.insight && <p className="mt-1 text-sm"><strong className="text-neutral-500">Insight: </strong>{j.insight}</p>}
                </article>
              ))}
            </div>
          </NotebookPage>
        ))}
        {journal.length === 0 && (
          <NotebookPage>
            <SectionHeader kicker="07" title="Daily Journal" />
            <p className="mt-6 text-sm text-neutral-500">No journal entries recorded.</p>
          </NotebookPage>
        )}

        {/* Conclusions */}
        <NotebookPage>
          <SectionHeader kicker="08" title="Conclusions" />
          <div className="mt-6 space-y-6 text-sm leading-relaxed">
            <p>
              Across <strong>{exps.length}</strong> experiments, this project produced <strong>{breakthroughs.length}</strong> documented
              breakthroughs and recorded <strong>{failures.length}</strong> failures. Architecture evolved through
              <strong> {arch.length}</strong> formal decisions, and the team logged <strong>{journal.length}</strong> daily reflections.
            </p>
            {breakthroughs.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-neutral-500">Notable breakthroughs</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {breakthroughs.slice(-5).map((b) => <li key={b.id}>{b.title}</li>)}
                </ul>
              </div>
            )}
            <p className="text-neutral-500">
              Generated automatically by Research OS on {format(new Date(), "MMMM d, yyyy 'at' HH:mm")}.
            </p>
          </div>
          <div className="mt-16 border-t border-neutral-300 pt-4 text-center text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            End of notebook
          </div>
        </NotebookPage>
      </div>
    </div>
  );
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function NotebookPage({ children, cover, pageNum }: { children: React.ReactNode; cover?: boolean; pageNum?: number }) {
  return (
    <div className={`print-page mx-auto mb-6 flex w-[210mm] flex-col bg-white p-[18mm] shadow-lg print:m-0 print:shadow-none ${cover ? "min-h-[297mm]" : "min-h-[297mm]"}`}>
      {!cover && (
        <header className="mb-6 flex items-center justify-between border-b border-neutral-200 pb-3 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          <span>Research Notebook</span>
          {pageNum && <span className="font-mono">— {pageNum} —</span>}
        </header>
      )}
      <div className="flex-1">{children}</div>
      {!cover && (
        <footer className="mt-6 border-t border-neutral-200 pt-3 text-[9px] uppercase tracking-wider text-neutral-400">
          {format(new Date(), "yyyy.MM.dd")} · Compiled by Research OS
        </footer>
      )}
    </div>
  );
}

function SectionHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">§ {kicker}</p>
      <h2 className="mt-1 font-display text-4xl tracking-tight">{title}</h2>
      <div className="mt-3 h-[2px] w-16 bg-gradient-to-r from-violet-600 to-blue-500" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-2 font-display text-4xl">{value}</p>
    </div>
  );
}

function ADRField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3">
      <p className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}

function ChartBlock({ title, data, dataKey, color }: { title: string; data: any[]; dataKey: string; color: string }) {
  const has = data.some((d) => d[dataKey] != null);
  return (
    <div className="print-avoid-break">
      <h3 className="text-xs uppercase tracking-wider text-neutral-500">{title}</h3>
      <div className="mt-2 rounded-lg border border-neutral-200 p-3" style={{ height: 220 }}>
        {has ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#e5e5e5" vertical={false} />
              <XAxis dataKey="idx" stroke="#737373" fontSize={10} />
              <YAxis stroke="#737373" fontSize={10} />
              <Tooltip />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="flex h-full items-center justify-center text-xs text-neutral-400">No data recorded for {dataKey}.</p>
        )}
      </div>
    </div>
  );
}
