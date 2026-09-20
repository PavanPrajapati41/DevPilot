import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight, AlertTriangle, XCircle, AlertCircle,
  Wand2, Eye, ArrowLeft, ExternalLink,
} from "lucide-react";
import CodePane from "../components/CodePane";
import { Issue } from "../data";

interface Props {
  issue: Issue;
  onBack: () => void;
  onFix: () => void;
}

export default function IssueInvestigation({ issue, onBack, onFix }: Props) {
  const [tab, setTab] = useState<"issue" | "fix">("issue");

  const Icon = issue.severity === "critical" ? XCircle : AlertTriangle;
  const iconColor = issue.severity === "critical" ? "var(--red)" : "var(--amber)";

  // Build diff arrays for the "fix" tab
  const diffs = issue.after.map((line, i) => {
    const before = issue.before[i];
    if (before === undefined) return "add" as const;
    if (line !== before) {
      if (issue.before.includes(line)) return null;
      return "add" as const;
    }
    return null;
  });

  return (
    <motion.div
      className="min-h-screen"
      style={{ paddingLeft: "60px" }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="page-shell">
        {/* Breadcrumb */}
        <button
          className="flex items-center gap-1.5 mb-6 group"
          style={{ color: "var(--text-2)" }}
          onClick={onBack}
        >
          <ArrowLeft size={13} className="group-hover:translate-x-[-2px] transition-transform" />
          <span className="t-caption group-hover:text-[var(--text-1)] transition-colors">Back to audit</span>
        </button>

        {/* Issue header */}
        <motion.div
          className="flex items-start gap-4 mb-7"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: issue.severity === "critical" ? "var(--red-dim)" : "var(--amber-dim)",
              border: `1px solid ${issue.severity === "critical" ? "rgba(255,85,85,0.25)" : "rgba(255,179,64,0.25)"}`,
            }}
          >
            <Icon size={18} color={iconColor} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="t-title" style={{ color: "var(--text-1)" }}>{issue.title}</h1>
              <span
                className="font-mono text-xs px-2.5 py-1 rounded-lg"
                style={{
                  background: issue.severity === "critical" ? "var(--red-dim)" : "var(--amber-dim)",
                  border: `1px solid ${issue.severity === "critical" ? "rgba(255,85,85,0.2)" : "rgba(255,179,64,0.2)"}`,
                  color: iconColor,
                }}
              >
                {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
              </span>
              <span
                className="font-mono text-xs px-2.5 py-1 rounded-lg"
                style={{ background: "rgba(91,127,255,0.08)", border: "1px solid rgba(91,127,255,0.15)", color: "var(--accent)" }}
              >
                {issue.category}
              </span>
            </div>
            <p className="font-mono text-xs" style={{ color: "var(--text-2)" }}>
              {issue.file}:{issue.line}
              {issue.col ? `:${issue.col}` : ""} — {issue.summary}
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: "rgba(10,10,28,0.8)", border: "1px solid var(--border)" }}>
          {(["issue", "fix"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tab === t ? "rgba(91,127,255,0.14)" : "transparent",
                color: tab === t ? "var(--text-1)" : "var(--text-2)",
                border: tab === t ? "1px solid rgba(91,127,255,0.22)" : "1px solid transparent",
              }}
            >
              {t === "issue" ? "Problematic Code" : "Recommended Fix"}
            </button>
          ))}
        </div>

        {/* Code pane */}
        <motion.div className="mb-5" key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {tab === "issue" ? (
            <CodePane
              lines={issue.before}
              startLine={issue.line - issue.highlightLine}
              highlightLine={issue.highlightLine}
              title={issue.file}
              maxHeight="260px"
              badge={
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded"
                  style={{ background: "rgba(255,179,64,0.1)", color: "var(--amber)", border: "1px solid rgba(255,179,64,0.2)" }}
                >
                  Line {issue.line}
                </span>
              }
            />
          ) : (
            <CodePane
              lines={issue.after}
              startLine={issue.line - issue.highlightLine}
              diffs={diffs}
              title={`${issue.file} — proposed fix`}
              maxHeight="260px"
              badge={
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded"
                  style={{ background: "var(--teal-dim)", color: "var(--teal)", border: "1px solid rgba(16,232,160,0.2)" }}
                >
                  Fixed
                </span>
              }
            />
          )}
        </motion.div>

        {/* Info panels */}
        <div className="grid-info mb-7">
          {/* Why */}
          <motion.div
            className="panel p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <AlertCircle size={12} color="var(--amber)" />
              <span className="t-caption" style={{ color: "var(--amber)" }}>Why this matters</span>
            </div>
            <p className="t-body text-sm leading-relaxed">{issue.why}</p>
          </motion.div>

          {/* Impact */}
          <motion.div
            className="panel p-4"
            style={{ borderColor: issue.severity === "critical" ? "rgba(255,85,85,0.18)" : "var(--border)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <ExternalLink size={12} color={iconColor} />
              <span className="t-caption" style={{ color: iconColor }}>Production Impact</span>
            </div>
            <p className="t-body text-sm leading-relaxed">{issue.impact}</p>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <motion.button
            className="btn btn-ghost"
            onClick={() => setTab("fix")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            <Eye size={14} />
            Preview Fix
          </motion.button>
          <motion.button
            className="btn btn-primary"
            style={{ padding: "0.65rem 1.5rem", fontSize: "0.85rem" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onFix}
          >
            <Wand2 size={14} />
            Fix Automatically
            <ChevronRight size={13} />
          </motion.button>
          <span className="t-caption ml-2" style={{ color: "rgba(136,136,176,0.45)" }}>
            AI will generate and apply the fix
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
