import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { loadAll, saveAll, newId, type DBData, type Experiment, type TimelineEvent, type JournalEntry, type ArchitectureDecision } from "./db";

type Ctx = {
  data: DBData;
  loaded: boolean;
  setProjectName: (name: string) => void;
  addExperiment: (e: Partial<Experiment>) => Experiment;
  updateExperiment: (id: string, patch: Partial<Experiment>) => void;
  deleteExperiment: (id: string) => void;
  addTimelineEvent: (e: Partial<TimelineEvent>) => void;
  deleteTimelineEvent: (id: string) => void;
  upsertJournal: (e: Partial<JournalEntry> & { date: string }) => void;
  addDecision: (d: Partial<ArchitectureDecision>) => void;
  updateDecision: (id: string, patch: Partial<ArchitectureDecision>) => void;
  deleteDecision: (id: string) => void;
  exportJSON: () => string;
  importJSON: (json: string) => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DBData>({
    experiments: [],
    timeline: [],
    journal: [],
    architecture: [],
    meta: { projectName: "Research Project", createdAt: Date.now() },
  });
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadAll().then((d) => { setData(d); setLoaded(true); });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { saveAll(data); }, 600);
  }, [data, loaded]);

  const ctx: Ctx = {
    data, loaded,
    setProjectName: (name) => setData((d) => ({ ...d, meta: { ...d.meta, projectName: name } })),
    addExperiment: (e) => {
      const exp: Experiment = {
        id: newId(),
        name: e.name ?? "Untitled Experiment",
        hypothesis: e.hypothesis ?? "",
        notes: e.notes ?? "",
        status: e.status ?? "draft",
        tags: e.tags ?? [],
        metrics: e.metrics ?? {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setData((d) => ({ ...d, experiments: [exp, ...d.experiments] }));
      return exp;
    },
    updateExperiment: (id, patch) => setData((d) => ({
      ...d,
      experiments: d.experiments.map((x) => x.id === id ? { ...x, ...patch, updatedAt: Date.now() } : x),
    })),
    deleteExperiment: (id) => setData((d) => ({ ...d, experiments: d.experiments.filter((x) => x.id !== id) })),
    addTimelineEvent: (e) => setData((d) => ({
      ...d,
      timeline: [{
        id: newId(),
        title: e.title ?? "Event",
        description: e.description ?? "",
        type: e.type ?? "note",
        createdAt: e.createdAt ?? Date.now(),
      }, ...d.timeline],
    })),
    deleteTimelineEvent: (id) => setData((d) => ({ ...d, timeline: d.timeline.filter((x) => x.id !== id) })),
    upsertJournal: (e) => setData((d) => {
      const existing = d.journal.find((j) => j.date === e.date);
      if (existing) {
        return { ...d, journal: d.journal.map((j) => j.date === e.date ? { ...j, ...e } : j) };
      }
      return { ...d, journal: [{
        id: newId(), date: e.date,
        mood: e.mood ?? 3, productivity: e.productivity ?? 3,
        goals: e.goals ?? "", challenge: e.challenge ?? "", insight: e.insight ?? "",
        createdAt: Date.now(),
      }, ...d.journal] };
    }),
    addDecision: (x) => setData((d) => ({
      ...d,
      architecture: [{
        id: newId(),
        title: x.title ?? "Decision",
        context: x.context ?? "",
        decision: x.decision ?? "",
        rationale: x.rationale ?? "",
        consequences: x.consequences ?? "",
        status: x.status ?? "proposed",
        createdAt: Date.now(),
      }, ...d.architecture],
    })),
    updateDecision: (id, patch) => setData((d) => ({
      ...d,
      architecture: d.architecture.map((x) => x.id === id ? { ...x, ...patch } : x),
    })),
    deleteDecision: (id) => setData((d) => ({ ...d, architecture: d.architecture.filter((x) => x.id !== id) })),
    exportJSON: () => JSON.stringify(data, null, 2),
    importJSON: (json) => { try { setData(JSON.parse(json)); } catch {} },
  };

  return <StoreContext.Provider value={ctx}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
