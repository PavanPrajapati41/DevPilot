import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, Check, Zap, Terminal } from "lucide-react";
import { Issue } from "../data";

type StepStatus = "idle" | "running" | "done";

const STEPS = [
  "Inspecting file structure",
  "Locating affected symbol",
  "Generating safe replacement",
  "Running static validation",
  "Preparing diff",
];

const STEP_DURATIONS = [650, 580, 950, 700, 450];

// Terminal stream line
function StreamLine({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.div
      className="flex items-start gap-2.5 py-0.5"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.25 }}
    >
      <span className="font-mono text-xs mt-0.5 flex-shrink-0" style={{ color: "rgba(91,127,255,0.5)" }}>›</span>
      <span className="font-mono text-xs" style={{ color: "rgba(238,238,248,0.55)" }}>{text}</span>
    </motion.div>
  );
}

// Diff line pair
function DiffPair({ before, after, lineNum }: { before?: string; after?: string; lineNum: number }) {
  const changed = before !== after && before !== undefined && after !== undefined;
  const added   = before === undefined && after !== undefined;
  const removed = after === undefined && before !== undefined;

  const renderCode = (code: string, type: "remove" | "add" | "neutral") => {
    const cls = type === "add" ? "diff-add" : type === "remove" ? "diff-remove" : "diff-neutral";

    return (
      <div className={`flex items-center ${cls} px-0`} style={{ minHeight: "1.75rem" }}>
        <span className="w-8 text-right pr-2.5 flex-shrink-0 font-mono select-none" style={{ color: "rgba(120,120,180,0.25)", fontSize: "0.7rem" }}>
          {lineNum}
        </span>
        <span
          className="w-5 flex-shrink-0 font-mono text-xs text-center"
          style={{ color: type === "add" ? "var(--teal)" : type === "remove" ? "var(--red)" : "transparent" }}
        >
          {type === "add" ? "+" : type === "remove" ? "−" : " "}
        </span>
        <span className="font-mono text-xs pr-4 whitespace-pre" style={{ color: "var(--text-1)", fontSize: "0.78rem" }}>
          {code || <>&nbsp;</>}
        </span>
      </div>
    );
  };

  if (added)   return renderCode(after!, "add");
  if (removed) return renderCode(before!, "remove");
  if (changed) return (
    <>
      {renderCode(before!, "remove")}
      {renderCode(after!, "add")}
    </>
  );
  return renderCode(before ?? after ?? "", "neutral");
}

interface Props {
  issue: Issue;
  onApply: () => void;
  onReject: () => void;
}

export default function AIFix({ issue, onApply, onReject }: Props) {
  const [steps, setSteps]       = useState<StepStatus[]>(STEPS.map(() => "idle"));
  const [showDiff, setShowDiff] = useState(false);
  const [streamLines, setStreamLines] = useState<string[]>([]);

  const STREAM = [
    `Reading ${issue.file}...`,
    `Found target at line ${issue.line}`,
    `Pattern: ${issue.summary}`,
    "Applying deployment-safe transformation",
    "Diff ready for review",
  ];

  useEffect(() => {
    let elapsed = 0;

    STEPS.forEach((_, i) => {
      setTimeout(() => {
        setSteps((prev) => {
          const next = [...prev] as StepStatus[];
          next[i] = "running";
          if (i > 0) next[i - 1] = "done";
          return next;
        });
        setStreamLines((prev) => [...prev, STREAM[i]]);
      }, elapsed);
      elapsed += STEP_DURATIONS[i];
    });

    setTimeout(() => {
      setSteps(STEPS.map(() => "done") as StepStatus[]);
      setTimeout(() => setShowDiff(true), 250);
    }, elapsed);
  }, []);

  // Build unified diff
  const maxLen = Math.max(issue.before.length, issue.after.length);
  const pairs  = Array.from({ length: maxLen }, (_, i) => ({
    before: issue.before[i],
    after:  issue.after[i],
    line:   i + 1,
  }));

  return (
    <motion.div
      className="min-h-screen"
      style={{ paddingLeft: "60px" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="page-shell">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3.5 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--accent-dim)",
              border: "1px solid rgba(91,127,255,0.25)",
              boxShadow: "0 0 20px rgba(91,127,255,0.12)",
            }}
          >
            <Zap size={19} color="var(--accent)" />
          </div>
          <div>
            <h2 className="t-title" style={{ color: "var(--text-1)" }}>DevPilot AI</h2>
            <p className="font-mono text-xs" style={{ color: "var(--text-2)" }}>
              Fixing: {issue.title} · {issue.file}:{issue.line}
            </p>
          </div>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid-aifix">
          {/* Left: AI reasoning */}
          <div className="flex flex-col gap-4">
            {/* Steps */}
            <motion.div
              className="panel p-5"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Terminal size={12} style={{ color: "var(--text-2)" }} />
                <span className="t-caption">Agent reasoning</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      {steps[i] === "done" ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                          <CheckCircle2 size={14} color="var(--teal)" />
                        </motion.div>
                      ) : steps[i] === "running" ? (
                        <motion.div
                          className="w-3 h-3 rounded-full border-2"
                          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(120,120,220,0.12)" }} />
                      )}
                    </div>
                    <span
                      className="text-sm font-mono"
                      style={{
                        color: steps[i] === "done" ? "var(--text-2)" : steps[i] === "running" ? "var(--text-1)" : "rgba(136,136,176,0.3)",
                        fontSize: "0.78rem",
                      }}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Terminal stream */}
            <motion.div
              className="panel-elevated p-4 font-mono"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 }}
              style={{ background: "rgba(0,0,0,0.5)", minHeight: 130 }}
            >
              <div className="flex items-center gap-2 mb-3" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                <span className="font-mono text-xs" style={{ color: "rgba(91,127,255,0.5)" }}>devpilot</span>
                <span className="font-mono text-xs" style={{ color: "rgba(136,136,176,0.3)" }}>—</span>
                <span className="font-mono text-xs" style={{ color: "rgba(136,136,176,0.3)" }}>fix agent</span>
              </div>
              {streamLines.map((line, i) => (
                <StreamLine key={i} text={line} delay={0} />
              ))}
              {streamLines.length < STREAM.length && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="font-mono text-xs" style={{ color: "rgba(91,127,255,0.5)" }}>›</span>
                  <span className="font-mono text-xs cursor-blink" style={{ color: "rgba(238,238,248,0.35)" }} />
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Diff viewer */}
          <AnimatePresence>
            {showDiff ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="panel overflow-hidden"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {/* Diff header */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ background: "rgba(0,0,0,0.35)", borderBottom: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {["#ff5f57","#febc2e","#28c840"].map((c) => (
                        <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.65 }} />
                      ))}
                    </div>
                    <span className="font-mono text-xs" style={{ color: "var(--text-2)" }}>{issue.file}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-mono text-xs flex items-center gap-1" style={{ color: "var(--red)" }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: "var(--red)" }} />
                      before
                    </span>
                    <span className="font-mono text-xs flex items-center gap-1" style={{ color: "var(--teal)" }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: "var(--teal)" }} />
                      after
                    </span>
                  </div>
                </div>

                {/* Unified diff */}
                <div className="overflow-auto py-2" style={{ maxHeight: 360 }}>
                  {pairs.map((pair, i) => (
                    <DiffPair
                      key={i}
                      before={pair.before}
                      after={pair.after}
                      lineNum={pair.line}
                    />
                  ))}
                </div>

                {/* Action bar */}
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.2)" }}
                >
                  <motion.button
                    className="btn btn-danger"
                    style={{ padding: "0.45rem 1rem" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onReject}
                  >
                    <X size={13} />
                    Reject
                  </motion.button>
                  <motion.button
                    className="btn btn-success"
                    style={{ padding: "0.45rem 1.25rem" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onApply}
                  >
                    <Check size={13} />
                    Apply Fix
                  </motion.button>
                  <span className="t-caption" style={{ color: "rgba(136,136,176,0.4)", marginLeft: 4 }}>
                    Changes will be written to disk
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="panel flex items-center justify-center"
                style={{ minHeight: 380 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-full border-2"
                    style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="t-caption">Generating diff…</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
