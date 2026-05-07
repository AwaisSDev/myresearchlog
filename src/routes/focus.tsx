import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { X, Save } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/focus")({ component: Focus });

function Focus() {
  const { addExperiment, addTimelineEvent } = useStore();
  const nav = useNavigate();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { save("experiment"); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save("experiment"); }
      if (e.key === "Escape") nav({ to: "/" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const save = (kind: "experiment" | "log") => {
    if (!title.trim() && !text.trim()) return;
    if (kind === "experiment") {
      addExperiment({ name: title || "Focus session", notes: text, status: "draft" });
      toast.success("Saved as experiment");
    } else {
      addTimelineEvent({ title: title || "Quick note", description: text, type: "note" });
      toast.success("Saved to timeline");
    }
    setTitle(""); setText("");
  };

  return (
    <div className="relative min-h-screen w-full">
      <div className="no-print absolute right-6 top-6 flex gap-2">
        <button onClick={() => save("log")} className="flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-1.5 text-xs backdrop-blur hover:bg-white">
          <Save className="h-3 w-3" /> Save as note
        </button>
        <button onClick={() => save("experiment")} className="flex items-center gap-1.5 rounded-lg gradient-primary px-3 py-1.5 text-xs text-white shadow-glow">
          <Save className="h-3 w-3" /> Save experiment <kbd className="ml-1 font-mono text-[10px] opacity-80">⌘↵</kbd>
        </button>
        <Link to="/" className="rounded-lg bg-white/70 p-2 backdrop-blur hover:bg-white"><X className="h-4 w-4" /></Link>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-24">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Focus mode · {format(new Date(), "EEE · MMM d · HH:mm")}</p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Experiment title…"
          className="mt-4 w-full border-0 bg-transparent font-display text-5xl tracking-tight outline-none placeholder:text-muted-foreground/40" />
        <textarea ref={ref} value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Start typing… everything autosaves. Press ⌘↵ to save as experiment, Esc to exit."
          className="mt-6 min-h-[60vh] w-full resize-none border-0 bg-transparent font-mono text-base leading-relaxed outline-none placeholder:text-muted-foreground/40" />
      </motion.div>
    </div>
  );
}
