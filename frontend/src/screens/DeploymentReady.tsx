import { motion } from "framer-motion";
import { CheckCircle2, Rocket, FileText, RotateCcw } from "lucide-react";
import ScoreRing from "../components/ScoreRing";

const CHECKS = ["Environment", "Dependencies", "Runtime", "Build", "Configuration"];

export default function DeploymentReady({ project, onReset }: { project: string; onReset: () => void }) {
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ paddingLeft: "60px", background: "var(--bg)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background radial glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 pointer-events-none"
        style={{ transform: "translate(-50%, -50%)" }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          style={{
            width: 560, height: 560,
            background: "radial-gradient(circle, rgba(16,232,160,0.07) 0%, rgba(91,127,255,0.04) 45%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
      </motion.div>

      {/* Expanding rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
          style={{ transform: "translate(-50%, -50%)", border: "1px solid rgba(16,232,160,0.12)" }}
          initial={{ width: 120, height: 120, opacity: 0 }}
          animate={{ width: 120 + i * 160, height: 120 + i * 160, opacity: [0, 0.5, 0] }}
          transition={{ duration: 2.5, delay: i * 0.35, repeat: Infinity, ease: "easeOut" }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: "var(--teal-dim)",
            border: "1px solid rgba(16,232,160,0.3)",
            boxShadow: "0 0 0 1px rgba(16,232,160,0.15), 0 0 48px rgba(16,232,160,0.18)",
          }}
        >
          <CheckCircle2 size={38} color="var(--teal)" strokeWidth={1.75} />
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: "spring" }}
        >
          <ScoreRing score={100} size={180} />
        </motion.div>

        {/* Headline */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h1
            className="font-mono font-bold tracking-tight mb-2"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", color: "var(--text-1)", letterSpacing: "-0.04em" }}
          >
            DEPLOYMENT READY
          </h1>
          <p className="t-body max-w-xs text-center" style={{ color: "var(--text-2)" }}>
            /{project} passed all critical deployment checks.
          </p>
        </motion.div>

        {/* Checklist */}
        <motion.div
          className="panel px-6 py-4 w-64"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          {CHECKS.map((name, i) => (
            <motion.div
              key={name}
              className="flex items-center gap-3 py-2"
              style={{ borderBottom: i < CHECKS.length - 1 ? "1px solid var(--border)" : "none" }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.07 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.55 + i * 0.07, type: "spring", stiffness: 300 }}
              >
                <CheckCircle2 size={13} color="var(--teal)" />
              </motion.div>
              <span className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{name}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
        >
          <div className="flex gap-3">
            <button className="btn btn-ghost">
              <FileText size={14} />
              View Audit Report
            </button>
            <motion.button
              className="btn btn-success"
              style={{ padding: "0.65rem 1.75rem", fontSize: "0.88rem" }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Rocket size={15} />
              Deploy Project
            </motion.button>
          </div>

          <button
            className="flex items-center gap-1.5 mt-2"
            style={{ color: "rgba(136,136,176,0.35)" }}
            onClick={onReset}
          >
            <RotateCcw size={11} />
            <span className="t-caption" style={{ color: "inherit" }}>Start new audit</span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
