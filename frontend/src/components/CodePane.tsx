import { Fragment } from "react";

type DiffType = "add" | "remove" | null;

interface LineProps {
  code: string;
  num: number;
  highlight?: boolean;
  diff?: DiffType;
}

// Minimal regex-based tokeniser for JS / JSON / env syntax
function tokenise(code: string): React.ReactNode {
  if (!code.trim()) return <>&nbsp;</>;

  const parts: React.ReactNode[] = [];
  let rest = code;
  let key  = 0;

  const push = (cls: string, text: string) =>
    parts.push(<span key={key++} className={cls}>{text}</span>);

  const patterns: [RegExp, string][] = [
    [/^(\/\/.*)/, "sc"],
    [/^(#.*)/, "sc"],
    [/^(process\.env\.\w+)/, "se"],
    [/^(\b(?:const|let|var|function|return|require|module|exports|import|from|export|default|async|await|if|else|for|while|new|class|extends|typeof|undefined|null|true|false)\b)/, "sk"],
    [/^("[^"]*"|'[^']*'|`[^`]*`)/, "ss"],
    [/^(\b\d+(?:\.\d+)?\b)/, "sn"],
    [/^(\b[A-Z_][A-Z0-9_]+\b)/, "se"],
    [/^(\w+(?=\s*\())/, "sf"],
    [/^([{}[\]().,;:=!<>+\-*/&|^~?%])/, "sp"],
    [/^(\w+)/, "sv"],
    [/^(\s+)/, ""],
  ];

  while (rest.length > 0) {
    let matched = false;
    for (const [re, cls] of patterns) {
      const m = rest.match(re);
      if (m) {
        if (cls) push(cls, m[1]);
        else parts.push(<Fragment key={key++}>{m[0]}</Fragment>);
        rest = rest.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      parts.push(<Fragment key={key++}>{rest[0]}</Fragment>);
      rest = rest.slice(1);
    }
  }

  return <>{parts}</>;
}

export function CodeLine({ code, num, highlight, diff }: LineProps) {
  const cls = highlight
    ? "line-highlight"
    : diff === "add"
    ? "diff-add"
    : diff === "remove"
    ? "diff-remove"
    : "diff-neutral";

  return (
    <div className={`flex items-stretch ${cls}`} style={{ minHeight: "1.75rem" }}>
      {/* Gutter */}
      <span
        className="flex-shrink-0 w-10 text-right pr-3 select-none font-mono text-xs leading-7"
        style={{ color: "rgba(120,120,180,0.3)", fontSize: "0.72rem" }}
      >
        {num}
      </span>

      {/* Diff marker */}
      {diff && (
        <span
          className="flex-shrink-0 w-5 font-mono text-xs leading-7 select-none"
          style={{ color: diff === "add" ? "var(--teal)" : "var(--red)", fontSize: "0.75rem" }}
        >
          {diff === "add" ? "+" : "−"}
        </span>
      )}
      {!diff && <span className="flex-shrink-0 w-5" />}

      {/* Code */}
      <span className="t-code leading-7 flex-1 pr-4 whitespace-pre">
        {tokenise(code)}
      </span>

      {/* Highlight badge */}
      {highlight && (
        <span
          className="flex-shrink-0 self-center mr-3 font-mono text-xs px-1.5 py-0.5 rounded"
          style={{ background: "rgba(255,179,64,0.15)", color: "var(--amber)", fontSize: "0.65rem" }}
        >
          ⚠ issue
        </span>
      )}
    </div>
  );
}

interface CodePaneProps {
  lines: string[];
  startLine?: number;
  highlightLine?: number; // 0-indexed
  diffs?: (DiffType)[];
  title?: string;
  badge?: React.ReactNode;
  maxHeight?: string;
}

export default function CodePane({
  lines, startLine = 1, highlightLine, diffs, title, badge, maxHeight = "none",
}: CodePaneProps) {
  return (
    <div
      className="panel-elevated overflow-hidden"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Titlebar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {["#ff5f57","#febc2e","#28c840"].map((c) => (
              <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
            ))}
          </div>
          {title && (
            <span className="t-mono" style={{ color: "var(--text-2)", fontSize: "0.75rem" }}>{title}</span>
          )}
        </div>
        {badge}
      </div>

      {/* Lines */}
      <div className="overflow-auto" style={{ maxHeight }}>
        {lines.map((line, i) => (
          <CodeLine
            key={i}
            code={line}
            num={startLine + i}
            highlight={highlightLine === i}
            diff={diffs?.[i] ?? null}
          />
        ))}
      </div>
    </div>
  );
}
