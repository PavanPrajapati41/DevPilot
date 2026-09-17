import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
  animate?: boolean;
}

export default function ScoreRing({ score, size = 180, strokeWidth = 7, animate: shouldAnimate = true }: Props) {
  const radius = (size - strokeWidth * 2) / 2;
  const circ   = 2 * Math.PI * radius;
  const mv     = useMotionValue(0);
  const dash   = useTransform(mv, [0, 100], [0, circ]);
  const offset = useTransform(dash, (d) => circ - d);
  const [display, setDisplay] = useState(shouldAnimate ? 0 : score);

  const isMax  = score === 100;
  const color  = isMax ? "#10e8a0" : score >= 80 ? "#5b7fff" : "#ffb340";
  const svgCls = isMax ? "score-svg-teal" : "score-svg";

  useEffect(() => {
    const ctrl = animate(mv, score, { duration: 1.5, ease: [0.16, 1, 0.3, 1] });
    const unsub = mv.on("change", (v) => setDisplay(Math.round(v)));
    return () => { ctrl.stop(); unsub(); };
  }, [score]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Pulse ring when 100 */}
      {isMax && (
        <span
          className="absolute rounded-full"
          style={{
            width: size * 0.72, height: size * 0.72,
            border: `2px solid ${color}`,
            animation: "pulse-ring 2.2s cubic-bezier(0.215,0.61,0.355,1) infinite",
            opacity: 0.35,
          }}
        />
      )}

      <svg width={size} height={size} className={svgCls} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(120,120,220,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          style={{ strokeDashoffset: offset }}
        />
      </svg>

      <div className="absolute flex flex-col items-center leading-none">
        <span
          className="font-mono font-bold tabular-nums"
          style={{ fontSize: size * 0.22, color, letterSpacing: "-0.04em" }}
        >
          {display}
        </span>
        <span
          className="font-mono mt-0.5"
          style={{ fontSize: size * 0.075, color: "rgba(136,136,176,0.6)", letterSpacing: "0.04em" }}
        >
          / 100
        </span>
        {isMax && (
          <span
            className="font-mono mt-1.5 uppercase tracking-widest"
            style={{ fontSize: size * 0.055, color, letterSpacing: "0.12em", opacity: 0.8 }}
          >
            Ready
          </span>
        )}
      </div>
    </div>
  );
}
