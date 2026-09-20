import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, ChevronRight, RefreshCw, BarChart2 } from "lucide-react";
import ScoreRing from "../components/ScoreRing";
import { Issue, Category } from "../data";

function StatusBadge({ status }: { status: "pass" | "warn" | "fail" }) {
  const map = {
    pass: { icon: CheckCircle2, color: "var(--teal)",  dim: "var(--teal-dim)",  border: "rgba(16,232,160,0.2)",  label: "Passed"   },
    warn: { icon: AlertTriangle,color: "var(--amber)", dim: "var(--amber-dim)", border: "rgba(255,179,64,0.2)",  label: "Warning"  },
    fail: { icon: XCircle,      color: "var(--red)",   dim: "var(--red-dim)",   border: "rgba(255,85,85,0.2)",   label: "Critical" },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono"
      style={{ background: s.dim, border: `1px solid ${s.border}`, color: s.color, fontSize: "0.67rem", fontWeight: 600 }}
    >
      <s.icon size={9} />
      {s.label}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: Issue["severity"] }) {
  const map = {
    critical: { color: "var(--red)",   dim: "var(--red-dim)",   border: "rgba(255,85,85,0.2)",  label: "Critical" },
    warning:  { color: "var(--amber)", dim: "var(--amber-dim)", border: "rgba(255,179,64,0.2)", label: "Warning"  },
    info:     { color: "var(--accent)",dim: "var(--accent-dim)",border: "rgba(91,127,255,0.2)", label: "Info"     },
  };
  const s = map[severity];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full font-mono"
      style={{ background: s.dim, border: `1px solid ${s.border}`, color: s.color, fontSize: "0.67rem", fontWeight: 600 }}
    >
      {s.label}
    </span>
  );
}

interface Props {
  project: string;
  issues: Issue[];
  categories: Category[];
  score: number;
  onInvestigate: (id: string) => void;
  onRescan: () => void;
}

export default function AuditDashboard({ project, issues, categories, score, onInvestigate, onRescan }: Props) {
  const open      = issues.filter((i) => !i.fixed);
  const fixed     = issues.filter((i) => i.fixed);
  const criticals = open.filter((i) => i.severity === "critical").length;
  const warnings  = open.filter((i) => i.severity === "warning").length;

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ paddingLeft: "60px" }}
    >
      <div className="page-shell page-shell--wide">
        {/* Header row */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="t-caption" style={{ color: "var(--text-2)" }}>/{project}</span>
              <ChevronRight size={11} style={{ color: "var(--text-2)" }} />
              <span className="t-caption" style={{ color: "var(--text-2)" }}>Deployment Audit</span>
            </div>
            <h1 className="t-headline">Deployment Health</h1>
          </div>
          <motion.button
            className="btn btn-ghost"
            onClick={onRescan}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            <RefreshCw size={13} />
            Re-scan
          </motion.button>
        </motion.div>

        <div className="grid-dashboard">
          {/* ── Left: Score + stats ─────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <motion.div
              className="panel flex flex-col items-center py-7 px-5 gap-4"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 }}
            >
              <ScoreRing score={score} size={160} />
              <div className="w-full">
                <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span className="t-caption">Critical</span>
                  <span className="font-mono text-xs font-semibold" style={{ color: criticals > 0 ? "var(--red)" : "var(--text-2)" }}>
                    {criticals}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span className="t-caption">Warning</span>
                  <span className="font-mono text-xs font-semibold" style={{ color: warnings > 0 ? "var(--amber)" : "var(--text-2)" }}>
                    {warnings}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="t-caption">Fixed</span>
                  <span className="font-mono text-xs font-semibold" style={{ color: "var(--teal)" }}>
                    {fixed.length}
                  </span>
                </div>
              </div>
              {open.length > 0 && (
                <p className="t-caption text-center" style={{ color: open.length > 0 ? "var(--amber)" : "var(--teal)" }}>
                  {open.length} issue{open.length > 1 ? "s" : ""} require attention
                </p>
              )}
            </motion.div>
          </div>

          {/* ── Right column ────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Categories */}
            <motion.div
              className="panel p-5"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={13} style={{ color: "var(--text-2)" }} />
                <span className="t-caption">Audit Categories</span>
              </div>

              <div className="flex flex-col gap-2">
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                    style={{ background: "rgba(120,120,220,0.03)", border: "1px solid var(--border)" }}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    whileHover={{ borderColor: "rgba(120,120,220,0.28)", backgroundColor: "rgba(120,120,220,0.05)" }}
                  >
                    {/* Color dot */}
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: cat.color }}
                    />

                    <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-1)" }}>
                      {cat.label}
                    </span>

                    {/* Mini progress bar */}
                    <div className="flex items-center gap-2">
                      <div className="w-20 rounded-full overflow-hidden" style={{ height: 3, background: "rgba(120,120,220,0.1)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: cat.status === "pass" ? "var(--teal)" : cat.status === "warn" ? "var(--amber)" : "var(--red)" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(cat.passed / cat.checks) * 100}%` }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                        />
                      </div>
                      <span className="font-mono text-xs w-10 text-right" style={{ color: "var(--text-2)" }}>
                        {cat.passed}/{cat.checks}
                      </span>
                    </div>

                    <StatusBadge status={cat.status} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Issues list */}
            <motion.div
              className="panel p-5"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="t-caption">Issues</span>
                <div className="flex items-center gap-2">
                  {open.length > 0 && (
                    <span
                      className="font-mono text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "var(--amber-dim)", color: "var(--amber)", border: "1px solid rgba(255,179,64,0.2)" }}
                    >
                      {open.length} open
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {issues.map((issue, i) => (
                    <motion.div
                      key={issue.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: issue.fixed ? 0.45 : 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="group flex items-center gap-3.5 px-4 py-3 rounded-xl cursor-pointer"
                      style={{
                        background: "rgba(120,120,220,0.02)",
                        border: "1px solid var(--border)",
                        opacity: issue.fixed ? 0.45 : 1,
                      }}
                      onClick={() => !issue.fixed && onInvestigate(issue.id)}
                      whileHover={!issue.fixed ? { backgroundColor: "rgba(91,127,255,0.04)" } : {}}
                    >
                      {/* Severity icon */}
                      {issue.fixed ? (
                        <CheckCircle2 size={14} color="var(--teal)" className="flex-shrink-0" />
                      ) : issue.severity === "critical" ? (
                        <XCircle size={14} color="var(--red)" className="flex-shrink-0" />
                      ) : (
                        <AlertTriangle size={14} color="var(--amber)" className="flex-shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="text-sm font-medium"
                            style={{
                              color: issue.fixed ? "var(--text-2)" : "var(--text-1)",
                              textDecoration: issue.fixed ? "line-through" : "none",
                            }}
                          >
                            {issue.title}
                          </span>
                          {!issue.fixed && <SeverityBadge severity={issue.severity} />}
                          {issue.fixed && (
                            <span className="font-mono text-xs" style={{ color: "var(--teal)" }}>Fixed</span>
                          )}
                        </div>
                        <span
                          className="font-mono text-xs"
                          style={{ color: "var(--text-2)", fontSize: "0.7rem" }}
                        >
                          {issue.file}:{issue.line} · {issue.category}
                        </span>
                      </div>

                      {!issue.fixed && (
                        <ChevronRight
                          size={14}
                          style={{ color: "var(--text-2)", opacity: 0.4 }}
                          className="flex-shrink-0 group-hover:opacity-80 transition-opacity"
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
