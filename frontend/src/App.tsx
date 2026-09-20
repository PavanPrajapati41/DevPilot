import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Home, Activity, AlertCircle, History, Settings, ChevronRight,
} from "lucide-react";

import { Screen, Issue, Category, ISSUES, CATEGORIES } from "./data";
import BootScreen        from "./screens/BootScreen";
import CommandCenter    from "./screens/CommandCenter";
import LiveScan        from "./screens/LiveScan";
import AuditDashboard  from "./screens/AuditDashboard";
import IssueInvestigation from "./screens/IssueInvestigation";
import AIFix           from "./screens/AIFix";
import ReAudit         from "./screens/ReAudit";
import DeploymentReady from "./screens/DeploymentReady";

// ── Score helper ──────────────────────────────────────────────────────────────
function calcScore(issues: Issue[]): number {
  const open = issues.filter((i) => !i.fixed);
  if (open.length === 0) return 100;
  const criticals = open.filter((i) => i.severity === "critical").length;
  const warnings  = open.filter((i) => i.severity === "warning").length;
  return Math.max(0, 100 - criticals * 12 - warnings * 5);
}

function calcCategories(issues: Issue[]): Category[] {
  return CATEGORIES.map((cat) => {
    const catIssues = issues.filter((i) => i.category === cat.label || i.category === cat.id);
    const open = catIssues.filter((i) => !i.fixed);
    if (open.length === 0 && catIssues.length > 0) return { ...cat, status: "pass" as const, passed: cat.checks };
    return cat;
  });
}

// ── Nav sidebar ───────────────────────────────────────────────────────────────
const NAV = [
  { icon: Home,        label: "Overview",  target: "dashboard"     as Screen },
  { icon: Activity,    label: "Audit",     target: "dashboard"     as Screen },
  { icon: AlertCircle, label: "Issues",    target: "investigation" as Screen },
  { icon: History,     label: "History",   target: "dashboard"     as Screen },
  { icon: Settings,    label: "Settings",  target: "dashboard"     as Screen },
];

function Sidebar({
  screen, onNav,
}: {
  screen: Screen; onNav: (s: Screen) => void;
}) {
  if (screen === "home" || screen === "boot") return null;

  return (
    <motion.nav
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 bottom-0 z-50 flex flex-col items-center py-4 gap-1"
      style={{
        width: 60,
        background: "rgba(5,5,15,0.92)",
        borderRight: "1px solid rgba(120,120,220,0.07)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
        style={{
          background: "var(--accent-dim)",
          border: "1px solid rgba(91,127,255,0.22)",
        }}
      >
        <Zap size={15} color="var(--accent)" />
      </div>

      {NAV.map(({ icon: Icon, label, target }) => (
        <button
          key={label}
          title={label}
          onClick={() => onNav(target)}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all group"
          style={{
            color: screen === target ? "var(--text-1)" : "rgba(136,136,176,0.4)",
            background: screen === target ? "rgba(91,127,255,0.1)" : "transparent",
            border: screen === target ? "1px solid rgba(91,127,255,0.15)" : "1px solid transparent",
          }}
        >
          <Icon size={15} />
        </button>
      ))}
    </motion.nav>
  );
}

// ── Breadcrumb strip ─────────────────────────────────────────────────────────
function BreadcrumbStrip({
  screen, project, issueTitle,
}: {
  screen: Screen; project: string; issueTitle?: string;
}) {
  if (screen === "home" || screen === "boot" || screen === "scan") return null;

  const crumbs = [
    { label: project, target: "dashboard" },
    screen === "investigation" || screen === "aifix" ? { label: "Issues", target: "dashboard" } : null,
    screen === "investigation" ? { label: issueTitle ?? "" } : null,
    screen === "aifix" ? { label: "AI Fix" } : null,
    screen === "reaudit" ? { label: "Re-auditing" } : null,
    screen === "ready" ? { label: "Deployment Ready" } : null,
  ].filter(Boolean) as { label: string; target?: string }[];

  return (
    <div
      className="fixed top-0 left-[60px] right-0 z-40 flex items-center px-8 gap-2"
      style={{
        height: 40,
        background: "rgba(5,5,15,0.85)",
        borderBottom: "1px solid rgba(120,120,220,0.06)",
        backdropFilter: "blur(12px)",
      }}
    >
      {crumbs.map((c, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={10} style={{ color: "rgba(136,136,176,0.3)" }} />}
          <span
            className="font-mono text-xs"
            style={{ color: i === crumbs.length - 1 ? "var(--text-1)" : "rgba(136,136,176,0.4)", fontSize: "0.7rem" }}
          >
            {i === 0 ? "/" : ""}{c.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Page transition wrapper ───────────────────────────────────────────────────
function Page({ children, k }: { children: React.ReactNode; k: string }) {
  return (
    <motion.div
      key={k}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      style={{ paddingTop: 40 }}
    >
      {children}
    </motion.div>
  );
}

const BOOT_SESSION_KEY = "devpilot_booted";

function getInitialScreen(): Screen {
  if (typeof window === "undefined") return "home";
  const alreadyBooted = window.sessionStorage.getItem(BOOT_SESSION_KEY) === "1";
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  return alreadyBooted || reducedMotion ? "home" : "boot";
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]     = useState<Screen>(getInitialScreen);
  const [project, setProject]   = useState("");
  const [issues, setIssues]     = useState<Issue[]>(ISSUES);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [prevScore, setPrevScore] = useState(82);

  const score      = calcScore(issues);
  const categories = calcCategories(issues);
  const activeIssue = issues.find((i) => i.id === activeId) ?? null;

  const go = useCallback((s: Screen) => setScreen(s), []);

  const handleBootDone = useCallback(() => {
    window.sessionStorage.setItem(BOOT_SESSION_KEY, "1");
    setScreen("home");
  }, []);

  const handleAnalyze = (name: string) => {
    setProject(name);
    setScreen("scan");
  };

  const handleInvestigate = (id: string) => {
    setActiveId(id);
    setScreen("investigation");
  };

  const handleApplyFix = () => {
    setPrevScore(score);
    setIssues((prev) => prev.map((i) => i.id === activeId ? { ...i, fixed: true } : i));
    setScreen("reaudit");
  };

  const handleReauditDone = () => {
    const remaining = issues.filter((i) => !i.fixed && i.id !== activeId);
    if (remaining.length === 0) {
      setScreen("ready");
    } else {
      setScreen("dashboard");
    }
  };

  const handleReset = () => {
    setIssues(ISSUES);
    setActiveId(null);
    setProject("");
    setScreen("home");
  };

  const newScore = calcScore(
    issues.map((i) => i.id === activeId ? { ...i, fixed: true } : i)
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Sidebar
        screen={screen}
        onNav={go}
      />

      <BreadcrumbStrip
        screen={screen}
        project={project}
        issueTitle={activeIssue?.title}
      />

      <AnimatePresence mode="wait">
        {screen === "boot" && (
          <motion.div key="boot" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <BootScreen onContinue={handleBootDone} />
          </motion.div>
        )}

        {screen === "home" && (
          <motion.div key="home" exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.22 }}>
            <CommandCenter onAnalyze={handleAnalyze} />
          </motion.div>
        )}

        {screen === "scan" && (
          <Page k="scan">
            <LiveScan project={project} onComplete={() => go("dashboard")} />
          </Page>
        )}

        {screen === "dashboard" && (
          <Page k="dashboard">
            <AuditDashboard
              project={project}
              issues={issues}
              categories={categories}
              score={score}
              onInvestigate={handleInvestigate}
              onRescan={() => go("scan")}
            />
          </Page>
        )}

        {screen === "investigation" && activeIssue && (
          <Page k={`inv-${activeId}`}>
            <IssueInvestigation
              issue={activeIssue}
              onBack={() => go("dashboard")}
              onFix={() => go("aifix")}
            />
          </Page>
        )}

        {screen === "aifix" && activeIssue && (
          <Page k={`fix-${activeId}`}>
            <AIFix
              issue={activeIssue}
              onApply={handleApplyFix}
              onReject={() => go("investigation")}
            />
          </Page>
        )}

        {screen === "reaudit" && (
          <Page k="reaudit">
            <ReAudit
              fromScore={prevScore}
              toScore={newScore}
              fixedIssue={activeIssue?.title ?? ""}
              onComplete={handleReauditDone}
            />
          </Page>
        )}

        {screen === "ready" && (
          <Page k="ready">
            <DeploymentReady project={project} onReset={handleReset} />
          </Page>
        )}
      </AnimatePresence>
    </div>
  );
}
