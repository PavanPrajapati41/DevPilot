import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, RefreshCw } from "lucide-react";
import ScoreRing from "../components/ScoreRing";

const RECHECK_STEPS = [
  { label: "Writing file changes to disk",         duration: 500 },
  { label: "Validating syntax",                    duration: 600 },
  { label: "Re-running affected checks",           duration: 800 },
  { label: "Cross-referencing deployment rules",   duration: 700 },
  { label: "Updating audit report",                duration: 450 },
];

export default function ReAudit({
  fromScore,
  toScore,
  fixedIssue,
  onComplete,
}: {
  fromScore: number;
  toScore: number;
  fixedIssue: string;
  onComplete: () => void;
}) {
  const [phase, setPhase]       = useState<"writing" | "scanning" | "done">("writing");
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [displayScore, setDisplayScore] = useState(fromScore);

  useEffect(() => {
    let elapsed = 0;
    RECHECK_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setActiveStep(i);
        if (i === 0) setPhase("writing");
        if (i === 2) setPhase("scanning");
      }, elapsed);

      setTimeout(() => {
        setDoneSteps((p) => [...p, i]);
      }, elapsed + step.duration - 60);

      elapsed += step.duration;
    });

    // Score animation partway through
    setTimeout(() => {
      setDisplayScore(toScore);
    }, elapsed - 900);

    // Finalise
    setTimeout(() => {
      setPhase("done");
      setTimeout(onComplete, 700);
    }, elapsed);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ paddingLeft: "60px" }}>
      <div className="w-full max-w-md px-6 sm:px-8">
        {/* Icon */}
        <div className="flex justify-center mb-7">
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: phase === "done" ? "var(--teal-dim)" : "var(--accent-dim)",
              border: `1px solid ${phase === "done" ? "rgba(16,232,160,0.25)" : "rgba(91,127,255,0.25)"}`,
              boxShadow: `0 0 28px ${phase === "done" ? "rgba(16,232,160,0.15)" : "rgba(91,127,255,0.12)"}`,
            }}
            animate={phase === "done" ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {phase === "done" ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 280 }}>
                <CheckCircle2 size={30} color="var(--teal)" />
              </motion.div>
            ) : (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
                <RefreshCw size={24} color="var(--accent)" />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Score ring */}
        <div className="flex justify-center mb-6">
          <ScoreRing score={displayScore} size={148} />
        </div>

        <div className="text-center mb-7">
          <h3 className="t-title mb-1">
            {phase === "done" ? "Fix verified" : "Re-auditing…"}
          </h3>
          <p className="t-body text-sm">
            {phase === "done"
              ? `Score updated ${fromScore} → ${toScore}`
              : `Validating fix for: ${fixedIssue}`}
          </p>
        </div>

        {/* Steps */}
        <motion.div
          className="panel p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col gap-2.5">
            {RECHECK_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-4 flex-shrink-0 flex justify-center">
                  {doneSteps.includes(i) ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                      <CheckCircle2 size={13} color="var(--teal)" />
                    </motion.div>
                  ) : i === activeStep ? (
                    <motion.div
                      className="w-3 h-3 rounded-full border-2"
                      style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(120,120,220,0.1)" }} />
                  )}
                </div>
                <span
                  className="font-mono text-xs"
                  style={{
                    color: doneSteps.includes(i) ? "var(--text-2)" : i === activeStep ? "var(--text-1)" : "rgba(136,136,176,0.25)",
                  }}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-4 rounded-full overflow-hidden" style={{ height: 2, background: "rgba(120,120,220,0.08)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, var(--accent), var(--teal))" }}
              animate={{ width: `${(doneSteps.length / RECHECK_STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
