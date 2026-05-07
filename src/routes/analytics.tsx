import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/GlassCard";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ScatterChart, Scatter, ZAxis, BarChart, Bar } from "recharts";
import { format } from "date-fns";

export const Route = createFileRoute("/analytics")({ component: Analytics });

function Analytics() {
  const { data } = useStore();
  const sorted = [...data.experiments].sort((a, b) => a.createdAt - b.createdAt);

  const trend = sorted.map((e, i) => ({
    name: e.name.slice(0, 14),
    idx: i + 1,
    accuracy: e.metrics.accuracy ?? null,
    latency: e.metrics.latency ?? null,
    detectionDelay: e.metrics.detectionDelay ?? null,
    loss: e.metrics.loss ?? null,
  }));

  const scatter = sorted.filter((e) => e.metrics.accuracy != null && e.metrics.latency != null).map((e) => ({
    x: e.metrics.latency, y: e.metrics.accuracy, name: e.name,
  }));

  const statusBuckets = ["draft", "running", "success", "failed"].map((s) => ({
    status: s, count: data.experiments.filter((e) => e.status === s).length,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Insights</p>
        <h1 className="mt-1 font-display text-5xl tracking-tight">Analytics</h1>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Accuracy trend" subtitle="Across experiments">
          <LineChartView data={trend} dataKey="accuracy" color="oklch(0.55 0.20 265)" />
        </ChartCard>
        <ChartCard title="Latency trend" subtitle="Lower is better (ms)">
          <LineChartView data={trend} dataKey="latency" color="oklch(0.65 0.18 200)" />
        </ChartCard>
        <ChartCard title="Detection delay" subtitle="Per experiment">
          <LineChartView data={trend} dataKey="detectionDelay" color="oklch(0.65 0.18 320)" />
        </ChartCard>
        <ChartCard title="Loss curve" subtitle="Lower is better">
          <LineChartView data={trend} dataKey="loss" color="oklch(0.65 0.18 25)" />
        </ChartCard>

        <ChartCard title="Latency vs accuracy" subtitle="Pareto frontier">
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid stroke="oklch(0.85 0.01 260 / 0.4)" />
              <XAxis dataKey="x" name="Latency" unit="ms" stroke="oklch(0.5 0.02 260)" fontSize={11} />
              <YAxis dataKey="y" name="Accuracy" unit="%" stroke="oklch(0.5 0.02 260)" fontSize={11} />
              <ZAxis range={[80, 80]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={tooltipStyle} />
              <Scatter data={scatter} fill="oklch(0.55 0.20 265)" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Experiment status" subtitle="Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusBuckets}>
              <CartesianGrid stroke="oklch(0.85 0.01 260 / 0.4)" vertical={false} />
              <XAxis dataKey="status" stroke="oklch(0.5 0.02 260)" fontSize={11} />
              <YAxis stroke="oklch(0.5 0.02 260)" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="url(#g1)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.65 0.20 265)" />
                  <stop offset="100%" stopColor="oklch(0.55 0.20 295)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: "oklch(1 0 0 / 0.95)",
  border: "1px solid oklch(0.9 0.01 260)",
  borderRadius: "10px",
  fontSize: "12px",
  boxShadow: "0 8px 24px -8px oklch(0.2 0.05 260 / 0.2)",
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard>
        <div className="mb-3">
          <h3 className="font-medium">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </GlassCard>
    </motion.div>
  );
}

function LineChartView({ data, dataKey, color }: { data: any[]; dataKey: string; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid stroke="oklch(0.85 0.01 260 / 0.4)" vertical={false} />
        <XAxis dataKey="idx" stroke="oklch(0.5 0.02 260)" fontSize={11} />
        <YAxis stroke="oklch(0.5 0.02 260)" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5}
          dot={{ r: 3, fill: color }} activeDot={{ r: 6 }}
          isAnimationActive animationDuration={900} />
      </LineChart>
    </ResponsiveContainer>
  );
}
