import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutDashboard, FlaskConical, GitBranch, BookOpen, Sparkles, Network, Command, Download } from "lucide-react";
import { useStore } from "@/lib/store";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/experiments", label: "Experiments", icon: FlaskConical },
  { to: "/timeline", label: "Timeline", icon: GitBranch },
  { to: "/analytics", label: "Analytics", icon: Sparkles },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/architecture", label: "Architecture", icon: Network },
] as const;

export function Sidebar({ onCommand }: { onCommand: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data } = useStore();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col p-4 md:flex"
    >
      <div className="glass flex h-full flex-col rounded-2xl p-3">
        <div className="flex items-center gap-2 px-2 py-3">
          <motion.div
            className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-glow"
            whileHover={{ rotate: 12, scale: 1.05 }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">Research OS</span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">{data.meta.projectName}</span>
          </div>
        </div>

        <button
          onClick={onCommand}
          className="mx-1 mt-2 flex items-center gap-2 rounded-lg border border-border/60 bg-white/40 px-3 py-2 text-xs text-muted-foreground transition hover:bg-white/70"
        >
          <Command className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Quick search</span>
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>

        <nav className="mt-4 flex flex-col gap-1">
          {items.map((it, i) => {
            const active = path === it.to;
            const Icon = it.icon;
            return (
              <motion.div
                key={it.to}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.05 * i, duration: 0.35 }}
              >
                <Link
                  to={it.to}
                  className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 -z-10 rounded-lg bg-white/80 shadow-sm border border-border/60"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="h-4 w-4" />
                  <span>{it.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="mt-auto pt-3">
          <Link
            to="/export"
            className="flex items-center gap-2 rounded-lg gradient-primary px-3 py-2.5 text-xs font-medium text-white shadow-glow transition hover:scale-[1.02]"
          >
            <Download className="h-3.5 w-3.5" />
            Judge Notebook
          </Link>
          <p className="mt-3 px-2 text-[10px] text-muted-foreground">
            {data.experiments.length} experiments · {data.timeline.length} events
          </p>
        </div>
      </div>
    </motion.aside>
  );
}
