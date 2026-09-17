import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FolderOpen, Zap, CheckCircle2, ArrowRight } from "lucide-react";

const FEATURES = ["Environment", "Dependencies", "Runtime", "Build", "Configuration"];

// Animated background orbs
function Orb({ x, y, size, color, delay }: { x: string; y: string; size: number; color: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y,
        width: size, height: size,
        background: `radial-gradient(circle at 40% 40%, ${color}, transparent 70%)`,
        filter: "blur(40px)",
        opacity: 0,
      }}
      animate={{ opacity: [0, 0.12, 0.06, 0.12, 0] }}
      transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// Floating particles
function Particles() {
  const items = Array.from({ length: 18 }, () => ({
    x: Math.random() * 100,
    delay: Math.random() * 6,
    dur: 4 + Math.random() * 4,
    size: Math.random() > 0.6 ? 2 : 1,
  }));
  return (
    <>
      {items.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`, bottom: -4,
            width: p.size, height: p.size * 5,
            background: `rgba(91,127,255,${0.2 + Math.random() * 0.3})`,
            borderRadius: 99,
          }}
          animate={{ y: [-8, -220], opacity: [0, 0.6, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

interface Props { onAnalyze: (name: string) => void; }

export default function CommandCenter({ onAnalyze }: Props) {
  const [project, setProject] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = useCallback((name: string) => setProject(name), []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

      {/* Orbs */}
      <Orb x="-10%" y="20%" size={500} color="#5b7fff" delay={0} />
      <Orb x="60%"  y="60%" size={400} color="#7c6eff" delay={2} />
      <Orb x="30%"  y="-5%" size={380} color="#10e8a0" delay={4} />

      {/* Particles */}
      <Particles />

      {/* Scan line */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(91,127,255,0.35), transparent)",
          animation: "scan-sweep 5s ease-in-out infinite",
          top: 0,
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center w-full max-w-lg px-6"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo badge */}
        <motion.div
          className="flex items-center gap-2.5 mb-7"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--accent-dim)",
              border: "1px solid rgba(91,127,255,0.28)",
              boxShadow: "0 0 20px rgba(91,127,255,0.15)",
            }}
          >
            <Zap size={17} color="var(--accent)" />
          </div>
          <span className="font-mono font-semibold tracking-widest text-sm" style={{ color: "rgba(238,238,248,0.5)", letterSpacing: "0.18em" }}>
            DEVPILOT
          </span>
          <span
            className="font-mono text-xs px-1.5 py-0.5 rounded"
            style={{ background: "rgba(91,127,255,0.08)", border: "1px solid rgba(91,127,255,0.18)", color: "var(--accent)" }}
          >
            v1.0
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="t-display text-center mb-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          style={{
            background: "linear-gradient(160deg, #eeeef8 30%, rgba(91,127,255,0.75))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Ship with<br />confidence.
        </motion.h1>

        <motion.p
          className="t-body text-center mb-10 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ color: "var(--text-2)" }}
        >
          AI‑powered local pre‑deployment auditor. Catch environment, runtime, and configuration issues before they hit production.
        </motion.p>

        {/* Drop zone */}
        <motion.div
          className="w-full mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <motion.div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); pick("my-nextjs-app"); }}
            onClick={() => pick("my-nextjs-app")}
            animate={dragging ? { scale: 1.015 } : { scale: 1 }}
            className="relative rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer overflow-hidden"
            style={{
              background: dragging || project
                ? "rgba(91,127,255,0.05)"
                : "rgba(10,10,28,0.6)",
              border: `1.5px dashed ${dragging || project ? "rgba(91,127,255,0.45)" : "rgba(120,120,220,0.16)"}`,
              transition: "border-color 0.2s, background 0.2s",
            }}
          >
            {/* Corner accent */}
            <div
              className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
              style={{ background: "radial-gradient(circle at 100% 0%, rgba(91,127,255,0.1), transparent 60%)" }}
            />

            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              animate={project ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.4 }}
              style={{
                background: project ? "var(--teal-dim)" : "rgba(91,127,255,0.08)",
                border: `1px solid ${project ? "rgba(16,232,160,0.3)" : "rgba(91,127,255,0.2)"}`,
              }}
            >
              <AnimatePresence mode="wait">
                {project ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <CheckCircle2 size={24} color="var(--teal)" />
                  </motion.div>
                ) : (
                  <motion.div key="up" initial={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Upload size={22} color="var(--accent)" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="text-center">
              {project ? (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="font-mono font-medium text-sm mb-0.5" style={{ color: "var(--teal)" }}>
                    /{project}
                  </p>
                  <p className="t-caption" style={{ color: "var(--text-2)" }}>Project loaded · click to change</p>
                </motion.div>
              ) : (
                <>
                  <p className="font-medium text-sm mb-1" style={{ color: "var(--text-1)" }}>Drop your project folder here</p>
                  <p className="t-body text-sm">or click to browse</p>
                </>
              )}
            </div>

            {/* Hidden file input */}
            <input ref={inputRef} type="file" className="hidden" />
          </motion.div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="w-full flex gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.36 }}
        >
          <button
            className="btn btn-ghost flex-1"
            onClick={() => pick("my-nextjs-app")}
            style={{ justifyContent: "center" }}
          >
            <FolderOpen size={14} />
            Browse Project
          </button>

          <motion.button
            className="btn btn-primary flex-[2]"
            disabled={!project}
            whileHover={project ? { scale: 1.02 } : {}}
            whileTap={project ? { scale: 0.97 } : {}}
            onClick={() => project && onAnalyze(project)}
            style={{ justifyContent: "center", fontSize: "0.85rem", padding: "0.65rem 1.4rem" }}
          >
            <Zap size={15} />
            Analyze Project
            <ArrowRight size={13} style={{ marginLeft: 2 }} />
          </motion.button>
        </motion.div>

        {/* Feature tags */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {FEATURES.map((f) => (
            <span
              key={f}
              className="t-caption px-3 py-1 rounded-full"
              style={{
                border: "1px solid rgba(120,120,220,0.1)",
                color: "rgba(136,136,176,0.5)",
                background: "rgba(10,10,28,0.4)",
              }}
            >
              {f}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
