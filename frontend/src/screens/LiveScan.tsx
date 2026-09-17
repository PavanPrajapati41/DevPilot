import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { SCAN_FILES, SCAN_STAGES } from "../data";

interface NodeDef {
  id: string; label: string; color: string;
  cx: number; cy: number;
}

const NODES: NodeDef[] = [
  { id: "proj",  label: "PROJECT",     color: "#eeeef8", cx: 380, cy: 50  },
  { id: "env",   label: "Environment", color: "#a78bfa", cx: 120, cy: 200 },
  { id: "deps",  label: "Dependencies",color: "#fb923c", cx: 320, cy: 220 },
  { id: "rt",    label: "Runtime",     color: "#5b7fff", cx: 520, cy: 200 },
  { id: "build", label: "Build",       color: "#10e8a0", cx: 200, cy: 340 },
  { id: "conf",  label: "Config",      color: "#f472b6", cx: 440, cy: 340 },
  { id: "ai",    label: "AI Analysis", color: "#5b7fff", cx: 320, cy: 460 },
];

const EDGES = [
  ["proj","env"],["proj","deps"],["proj","rt"],
  ["env","build"],["deps","build"],["rt","build"],
  ["build","conf"],["build","ai"],["conf","ai"],
];

const STAGE_NODES = ["proj","env","deps","rt","build","conf","ai"];

type LineStatus = "idle" | "active" | "done";

export default function LiveScan({ project, onComplete }: { project: string; onComplete: () => void }) {
  const [nodeStatus, setNodeStatus] = useState<Record<string,LineStatus>>({});
  const [edgeStatus, setEdgeStatus] = useState<Record<string,LineStatus>>({});
  const [stageIdx, setStageIdx]     = useState(0);
  const [fileIdx, setFileIdx]       = useState(0);
  const [progress, setProgress]     = useState(0);
  const [doneStages, setDoneStages] = useState<number[]>([]);

  useEffect(() => {
    let elapsed = 0;
    const total = SCAN_STAGES.reduce((s, st) => s + st.duration, 0);

    SCAN_STAGES.forEach((stage, i) => {
      // Stage start
      setTimeout(() => {
        setStageIdx(i);
        const nid = STAGE_NODES[i];
        setNodeStatus((p) => ({ ...p, [nid]: "active" }));
        if (i > 0) {
          setNodeStatus((p) => ({ ...p, [STAGE_NODES[i-1]]: "done" }));
        }
        // Activate edges touching this node
        EDGES.forEach(([a,b]) => {
          if (a === nid || b === nid) {
            setEdgeStatus((p) => ({ ...p, [`${a}-${b}`]: "active" }));
          }
        });
        // File cycling
        const cycle = setInterval(() => setFileIdx((f) => (f+1) % SCAN_FILES.length), 190);
        setTimeout(() => clearInterval(cycle), stage.duration - 10);
      }, elapsed);

      // Stage done
      setTimeout(() => {
        setDoneStages((p) => [...p, i]);
        EDGES.forEach(([a,b]) => {
          if (a === STAGE_NODES[i] || b === STAGE_NODES[i]) {
            setEdgeStatus((p) => ({ ...p, [`${a}-${b}`]: "done" }));
          }
        });
      }, elapsed + stage.duration - 50);

      elapsed += stage.duration;
    });

    // Finalise
    setTimeout(() => {
      setNodeStatus(Object.fromEntries(STAGE_NODES.map((n) => [n,"done"])));
      setProgress(100);
      setTimeout(onComplete, 550);
    }, total);

    // Smooth progress
    const tick = setInterval(() => {
      setProgress((p) => {
        const target = Math.min(99, (elapsed / total) * 100 + 2);
        return p < target ? p + 0.8 : p;
      });
    }, 40);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ paddingLeft: "60px", background: "var(--bg)" }}>
      {/* Scan line */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none z-10"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(91,127,255,0.4), transparent)",
          animation: "scan-sweep 3.5s ease-in-out infinite",
          top: 0,
        }}
      />

      <div className="w-full max-w-2xl px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2.5 mb-4 px-3.5 py-1.5 rounded-full glass" style={{ border: "1px solid rgba(91,127,255,0.18)" }}>
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--accent)" }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="t-caption" style={{ color: "var(--accent)" }}>SCANNING</span>
          </div>

          <h2 className="t-headline mb-1 font-mono" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.03em" }}>
            /{project}
          </h2>

          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className="t-mono" style={{ color: "var(--text-2)", fontSize: "0.75rem" }}>Analyzing</span>
            <motion.span
              key={fileIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="t-mono"
              style={{ color: "var(--accent)", fontSize: "0.75rem" }}
            >
              {SCAN_FILES[fileIdx]}
            </motion.span>
          </div>
        </motion.div>

        {/* Node graph */}
        <div className="relative mb-6" style={{ height: 320 }}>
          <svg
            viewBox="0 0 760 520"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Edges */}
            {EDGES.map(([a, b]) => {
              const na = NODES.find((n) => n.id === a)!;
              const nb = NODES.find((n) => n.id === b)!;
              const key = `${a}-${b}`;
              const active = edgeStatus[key] === "active";
              const done   = edgeStatus[key] === "done";
              return (
                <g key={key}>
                  {/* Base line */}
                  <line
                    x1={na.cx} y1={na.cy} x2={nb.cx} y2={nb.cy}
                    stroke="rgba(120,120,220,0.08)" strokeWidth={1.5}
                  />
                  {/* Animated line */}
                  {(active || done) && (
                    <motion.line
                      x1={na.cx} y1={na.cy} x2={nb.cx} y2={nb.cy}
                      stroke={done ? "#5b7fff" : "#7c6eff"}
                      strokeWidth={done ? 1.5 : 2}
                      strokeOpacity={done ? 0.5 : 0.9}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  )}
                  {/* Moving dot on active */}
                  {active && (
                    <motion.circle
                      r={3} fill="#7c6eff" opacity={0.9}
                      initial={{ offsetDistance: "0%" } as any}
                    >
                      <animateMotion
                        dur="1.2s" repeatCount="indefinite"
                        path={`M${na.cx},${na.cy} L${nb.cx},${nb.cy}`}
                      />
                    </motion.circle>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {NODES.map((node) => {
              const st = nodeStatus[node.id];
              const active = st === "active";
              const done   = st === "done";
              const r = node.id === "proj" || node.id === "ai" ? 32 : 26;

              return (
                <g key={node.id}>
                  {/* Glow ring when active */}
                  {active && (
                    <motion.circle
                      cx={node.cx} cy={node.cy} r={r + 10}
                      fill="none" stroke={node.color} strokeWidth={1}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}

                  {/* Node circle */}
                  <motion.circle
                    cx={node.cx} cy={node.cy} r={r}
                    fill={active ? `${node.color}22` : done ? `${node.color}14` : "rgba(10,10,28,0.8)"}
                    stroke={active || done ? node.color : "rgba(120,120,220,0.12)"}
                    strokeWidth={active ? 2 : 1.5}
                    strokeOpacity={active ? 0.9 : done ? 0.5 : 1}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
                  />

                  {/* Label */}
                  <motion.text
                    x={node.cx} y={node.cy + 2}
                    textAnchor="middle" dominantBaseline="middle"
                    fontFamily="'JetBrains Mono', monospace"
                    fontSize={node.id === "proj" || node.id === "ai" ? 9 : 8}
                    fontWeight="600"
                    fill={active ? node.color : done ? `${node.color}` : "rgba(136,136,176,0.5)"}
                    fillOpacity={active ? 1 : done ? 0.7 : 1}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {node.label.toUpperCase()}
                  </motion.text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Stage progress panel */}
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ padding: "1.25rem" }}
        >
          {/* Progress bar + % */}
          <div className="flex items-center justify-between mb-3">
            <span className="t-caption">{SCAN_STAGES[stageIdx]?.label}</span>
            <span className="font-mono font-semibold text-sm" style={{ color: "var(--accent)" }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="rounded-full overflow-hidden mb-4" style={{ height: 3, background: "rgba(120,120,220,0.08)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--accent), #7c6eff)" }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Stage list */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {SCAN_STAGES.map((stage, i) => (
              <div key={i} className="flex items-center gap-2.5">
                {doneStages.includes(i) ? (
                  <CheckCircle2 size={11} color="var(--teal)" />
                ) : i === stageIdx ? (
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: "var(--accent)" }}
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: "rgba(120,120,220,0.12)" }} />
                )}
                <span
                  className="t-mono text-xs truncate"
                  style={{
                    color: doneStages.includes(i) ? "var(--text-2)" : i === stageIdx ? "var(--text-1)" : "rgba(136,136,176,0.35)",
                  }}
                >
                  {stage.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
