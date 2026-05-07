import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FlaskConical, GitBranch, BookOpen, ArrowRight, TrendingUp, Sparkles, Network } from "lucide-react";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/GlassCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { format, formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const { data, setProjectName } = useStore();
  const recent = data.experiments.slice(0, 4);
  const recentEvents = data.timeline.slice(0, 5);
  const successRate = data.experiments.length
    ? Math.round((data.experiments.filter((e) => e.status === "success").length / data.experiments.length) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-12">
      <motion.header
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-end justify-between gap-4"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{format(new Date(), "EEEE · MMMM d, yyyy")}</p>
          <input
            value={data.meta.projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="mt-2 w-full max-w-xl border-0 bg-transparent font-display text-5xl tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50 focus:text-gradient"
            placeholder="Untitled research project"
          />
          <p className="mt-2 text-sm text-muted-foreground">A premium operating system for your research.</p>
        </div>
      </motion.header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Experiments", value: data.experiments.length, icon: FlaskConical, color: "from-blue-500/20 to-violet-500/20" },
          { label: "Success rate", value: successRate, suffix: "%", icon: TrendingUp, color: "from-emerald-500/20 to-teal-500/20" },
          { label: "Milestones", value: data.timeline.length, icon: GitBranch, color: "from-fuchsia-500/20 to-pink-500/20" },
          { label: "Decisions", value: data.architecture.length, icon: Network, color: "from-amber-500/20 to-orange-500/20" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
              <GlassCard className="relative overflow-hidden">
                <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.color} blur-xl`} />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-3 font-display text-4xl tracking-tight">
                  <AnimatedCounter value={s.value} />{s.suffix ?? ""}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-tight">Recent experiments</h2>
            <Link to="/experiments" className="flex items-center gap-1 text-xs text-primary hover:underline">
              All experiments <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyHint icon={FlaskConical} text="No experiments yet" cta="Create one" to="/experiments" />
          ) : (
            <div className="space-y-2">
              {recent.map((e) => (
                <motion.div
                  key={e.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-white/40 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusDot status={e.status} />
                      <p className="truncate text-sm font-medium">{e.name}</p>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{e.hypothesis || "No hypothesis"}</p>
                  </div>
                  <span className="ml-4 shrink-0 text-[10px] text-muted-foreground">
                    {formatDistanceToNow(e.updatedAt, { addSuffix: true })}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-tight">Activity</h2>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </div>
          {recentEvents.length === 0 ? (
            <EmptyHint icon={GitBranch} text="No events yet" cta="Open timeline" to="/timeline" />
          ) : (
            <ol className="relative space-y-4 border-l border-border/60 pl-4">
              {recentEvents.map((ev) => (
                <li key={ev.id} className="relative">
                  <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ${
                    ev.type === "breakthrough" ? "bg-emerald-500" :
                    ev.type === "failure" ? "bg-rose-500" :
                    ev.type === "milestone" ? "bg-violet-500" : "bg-slate-400"
                  } ring-4 ring-background`} />
                  <p className="text-sm font-medium">{ev.title}</p>
                  <p className="text-[10px] text-muted-foreground">{format(ev.createdAt, "MMM d · HH:mm")}</p>
                </li>
              ))}
            </ol>
          )}
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <QuickLink to="/journal" icon={BookOpen} title="Daily Journal" desc="Mood, goals, insights." />
        <QuickLink to="/architecture" icon={Network} title="Architecture Log" desc="Why every decision was made." />
        <QuickLink to="/export" icon={Sparkles} title="Judge Notebook" desc="Export a printable PDF notebook." />
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const c =
    status === "success" ? "bg-emerald-500" :
    status === "running" ? "bg-blue-500 animate-pulse" :
    status === "failed" ? "bg-rose-500" : "bg-slate-400";
  return <span className={`h-2 w-2 rounded-full ${c}`} />;
}

function EmptyHint({ icon: Icon, text, cta, to }: { icon: any; text: string; cta: string; to: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Icon className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{text}</p>
      <Link to={to} className="text-xs text-primary hover:underline">{cta}</Link>
    </div>
  );
}

function QuickLink({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to}>
      <motion.div whileHover={{ y: -3 }} className="glass group rounded-2xl p-5 transition">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="mt-3 font-medium">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
        <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 transition group-hover:opacity-100">
          Open <ArrowRight className="h-3 w-3" />
        </div>
      </motion.div>
    </Link>
  );
}
