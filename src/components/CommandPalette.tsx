import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, FlaskConical, GitBranch, BookOpen, Network, Sparkles, Plus, Download, Focus } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const nav = useNavigate();
  const { addExperiment, addTimelineEvent } = useStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (to: string) => { onOpenChange(false); nav({ to: to as never }); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="no-print fixed inset-0 z-50 flex items-start justify-center bg-black/20 p-4 pt-[15vh] backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl glass-strong rounded-2xl overflow-hidden"
          >
            <Command label="Command palette">
              <Command.Input
                placeholder="Search or run a command…"
                className="w-full border-0 border-b border-border/60 bg-transparent px-5 py-4 text-sm outline-none placeholder:text-muted-foreground"
              />
              <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
                <Command.Empty className="px-4 py-8 text-center text-sm text-muted-foreground">No results.</Command.Empty>
                <Command.Group heading="Navigate" className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Item icon={LayoutDashboard} label="Dashboard" onSelect={() => go("/")} />
                  <Item icon={FlaskConical} label="Experiments" onSelect={() => go("/experiments")} />
                  <Item icon={GitBranch} label="Timeline" onSelect={() => go("/timeline")} />
                  <Item icon={Sparkles} label="Analytics" onSelect={() => go("/analytics")} />
                  <Item icon={BookOpen} label="Journal" onSelect={() => go("/journal")} />
                  <Item icon={Network} label="Architecture" onSelect={() => go("/architecture")} />
                  <Item icon={Focus} label="Focus Mode" onSelect={() => go("/focus")} />
                  <Item icon={Download} label="Judge Notebook Export" onSelect={() => go("/export")} />
                </Command.Group>
                <Command.Group heading="Actions" className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Item icon={Plus} label="New experiment" onSelect={() => { addExperiment({ name: "New Experiment" }); toast.success("Experiment created"); onOpenChange(false); go("/experiments"); }} />
                  <Item icon={Plus} label="New milestone" onSelect={() => { addTimelineEvent({ title: "New milestone", type: "milestone" }); toast.success("Milestone added"); onOpenChange(false); go("/timeline"); }} />
                  <Item icon={Plus} label="Log breakthrough" onSelect={() => { addTimelineEvent({ title: "Breakthrough", type: "breakthrough" }); toast.success("Logged"); onOpenChange(false); go("/timeline"); }} />
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Item({ icon: Icon, label, onSelect }: { icon: any; label: string; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Command.Item>
  );
}
