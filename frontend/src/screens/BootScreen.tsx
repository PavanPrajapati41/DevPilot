import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const CELL = 48; // target cell size in px, before the grid divides the viewport evenly
const GAP = 3;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function computeGrid() {
  const cols = clamp(Math.round(window.innerWidth / (CELL + GAP)), 14, 40);
  const rows = clamp(Math.round(window.innerHeight / (CELL + GAP)), 8, 24);
  return { cols, rows };
}

export default function BootScreen({ onContinue }: { onContinue: () => void }) {
  const [grid, setGrid] = useState(computeGrid);
  const [origin, setOrigin] = useState({
    row: Math.floor(grid.rows / 2),
    col: Math.floor(grid.cols / 2),
  });
  const [ignited, setIgnited] = useState(false);
  const [rippling, setRippling] = useState(false);
  const [exiting, setExiting] = useState(false);
  const rippleTimeout = useRef<number | undefined>(undefined);

  // Recompute grid dimensions on resize (debounced) so it always fills the viewport
  useEffect(() => {
    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setGrid(computeGrid()), 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
  }, []);

  // Re-center the ignition origin whenever the grid is resized
  useEffect(() => {
    setOrigin({ row: Math.floor(grid.rows / 2), col: Math.floor(grid.cols / 2) });
  }, [grid.cols, grid.rows]);

  // Power on shortly after mount
  useEffect(() => {
    const t = setTimeout(() => setIgnited(true), 120);
    return () => clearTimeout(t);
  }, []);

  const handleContinue = useCallback(() => {
    setExiting((was) => {
      if (was) return was;
      window.setTimeout(onContinue, 550);
      return true;
    });
  }, [onContinue]);

  // Enter / Space / Escape all continue into the app
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        handleContinue();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleContinue]);

  const cells = useMemo(() => {
    const out: { row: number; col: number; delay: number }[] = [];
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const dx = c - origin.col;
        const dy = r - origin.row;
        const dist = Math.sqrt(dx * dx + dy * dy);
        out.push({ row: r, col: c, delay: dist * 26 });
      }
    }
    return out;
  }, [grid.rows, grid.cols, origin.row, origin.col]);

  const handleCellClick = (row: number, col: number) => {
    setOrigin({ row, col });
    setRippling(true);
    window.clearTimeout(rippleTimeout.current);
    rippleTimeout.current = window.setTimeout(() => setRippling(false), 900);
  };

  const gridClass = [
    "boot-grid",
    ignited ? "is-ignited" : "",
    rippling ? "is-rippling" : "",
    exiting ? "is-exiting" : "",
  ].filter(Boolean).join(" ");

  return (
    <motion.div
      className="fixed inset-0"
      style={{ background: "var(--bg)", overflow: "hidden" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className={gridClass}
        aria-hidden="true"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
          gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
        }}
      >
        {cells.map((cell) => (
          <div
            key={`${cell.row}-${cell.col}`}
            className="boot-cell"
            style={{ "--delay": `${cell.delay}ms` } as React.CSSProperties}
            onClick={() => handleCellClick(cell.row, cell.col)}
          />
        ))}
      </div>

      {/* Center overlay — pointer-events off except the actual button, so clicks
          land on the grid cells behind it for the ripple effect */}
      <div className="boot-overlay">
        <motion.div
          className="flex flex-col items-center gap-5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: exiting ? 0 : 1, y: 0 }}
          transition={{ delay: exiting ? 0 : 0.9, duration: exiting ? 0.25 : 0.6 }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent-dim)", border: "1px solid rgba(91,127,255,0.3)" }}
            >
              <Zap size={18} color="var(--accent)" />
            </div>
            <span
              className="font-mono font-bold tracking-tight"
              style={{ fontSize: "1.6rem", color: "var(--text-1)", letterSpacing: "-0.03em" }}
            >
              DEVPILOT
            </span>
          </div>
          <p className="t-body cursor-blink" style={{ color: "var(--text-2)" }}>
            Click the grid to test the signal
          </p>
          <motion.button
            className="btn btn-primary"
            style={{ pointerEvents: "auto", marginTop: "0.25rem" }}
            onClick={handleContinue}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            Enter DevPilot →
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
