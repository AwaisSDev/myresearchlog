import { openDB, type IDBPDatabase } from "idb";
import { nanoid } from "nanoid";

export type Experiment = {
  id: string;
  name: string;
  hypothesis: string;
  notes: string;
  status: "running" | "success" | "failed" | "draft";
  tags: string[];
  metrics: { accuracy?: number; latency?: number; detectionDelay?: number; loss?: number };
  createdAt: number;
  updatedAt: number;
};

export type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  type: "milestone" | "breakthrough" | "failure" | "note";
  createdAt: number;
};

export type JournalEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1-5
  productivity: number; // 1-5
  goals: string;
  challenge: string;
  insight: string;
  createdAt: number;
};

export type ArchitectureDecision = {
  id: string;
  title: string;
  context: string;
  decision: string;
  rationale: string;
  consequences: string;
  status: "proposed" | "accepted" | "deprecated";
  createdAt: number;
};

export type DBData = {
  experiments: Experiment[];
  timeline: TimelineEvent[];
  journal: JournalEntry[];
  architecture: ArchitectureDecision[];
  meta: { projectName: string; createdAt: number };
};

const DB_NAME = "research-os";
const STORE = "kv";

let _db: Promise<IDBPDatabase> | null = null;
function getDB() {
  if (typeof window === "undefined") return null;
  if (!_db) {
    _db = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      },
    });
  }
  return _db;
}

export async function loadAll(): Promise<DBData> {
  const db = await getDB();
  const empty: DBData = {
    experiments: [],
    timeline: [],
    journal: [],
    architecture: [],
    meta: { projectName: "Research Project", createdAt: Date.now() },
  };
  if (!db) return empty;
  const data = (await db.get(STORE, "data")) as DBData | undefined;
  return data ?? empty;
}

export async function saveAll(data: DBData) {
  const db = await getDB();
  if (!db) return;
  await db.put(STORE, data, "data");
  // Mirror to localStorage as backup
  try { localStorage.setItem("research-os-backup", JSON.stringify(data)); } catch {}
}

export const newId = () => nanoid(10);
