export type Severity = "critical" | "warning" | "info";
export type Screen =
  | "home"
  | "scan"
  | "dashboard"
  | "investigation"
  | "aifix"
  | "reaudit"
  | "ready";

export interface Issue {
  id: string;
  title: string;
  file: string;
  line: number;
  col?: number;
  severity: Severity;
  category: string;
  summary: string;
  why: string;
  impact: string;
  before: string[];
  after: string[];
  highlightLine: number; // 0-indexed within before[]
  fixed: boolean;
}

export const ISSUES: Issue[] = [
  {
    id: "PORT",
    title: "Hardcoded Port",
    file: "server.js",
    line: 47,
    col: 12,
    severity: "warning",
    category: "Runtime",
    summary: "app.listen(3000) — static port prevents platform assignment",
    why: "Production platforms (Heroku, Railway, Render, AWS ECS) assign a dynamic PORT at runtime. Hardcoding 3000 means the process will start on a different port than the load balancer expects, causing immediate 502 errors.",
    impact: "Deployment will fail on all container-based platforms.",
    before: [
      "const express = require('express');",
      "const app     = express();",
      "",
      "// TODO: make port configurable",
      "const PORT = 3000;",
      "",
      "app.listen(PORT, () => {",
      "  console.log(`Listening on port ${PORT}`);",
      "});",
    ],
    after: [
      "const express = require('express');",
      "const app     = express();",
      "",
      "const PORT = process.env.PORT || 3000;",
      "",
      "app.listen(PORT, () => {",
      "  console.log(`Listening on port ${PORT}`);",
      "});",
    ],
    highlightLine: 4,
    fixed: false,
  },
  {
    id: "DB_URL",
    title: "Missing Environment Variable",
    file: ".env.example",
    line: 12,
    severity: "critical",
    category: "Environment",
    summary: "DATABASE_URL referenced in db/connection.ts but absent from .env.example",
    why: "DATABASE_URL is dereferenced on startup in db/connection.ts with no fallback. When deploying to a fresh environment, the variable will be undefined, causing the connection pool to throw before any request is served.",
    impact: "Application crashes on boot in all staging and production environments.",
    before: [
      "# .env.example — commit this, not .env",
      "NODE_ENV=development",
      "API_SECRET=replace-me",
      "REDIS_URL=redis://localhost:6379",
    ],
    after: [
      "# .env.example — commit this, not .env",
      "NODE_ENV=development",
      "API_SECRET=replace-me",
      "REDIS_URL=redis://localhost:6379",
      "DATABASE_URL=postgresql://user:pass@localhost:5432/mydb",
    ],
    highlightLine: 3,
    fixed: false,
  },
  {
    id: "NODE_VER",
    title: "No Node.js Version Constraint",
    file: "package.json",
    line: 6,
    severity: "warning",
    category: "Dependencies",
    summary: '"engines" field absent — platform may select incompatible Node version',
    why: 'Without an "engines" constraint, platforms like Vercel, Netlify, and Railway choose the Node version automatically. Your codebase uses optional chaining (?.) and nullish coalescing (??) which require Node ≥ 14, but platforms sometimes default to Node 12.',
    impact: "SyntaxError at startup on platforms that choose Node 12 or earlier.",
    before: [
      "{",
      '  "name": "my-app",',
      '  "version": "1.0.0",',
      '  "private": true,',
      '  "scripts": {',
      '    "start": "node dist/server.js",',
      '    "build": "tsc"',
      "  },",
      '  "dependencies": {',
      '    "express": "^4.18.2"',
      "  }",
      "}",
    ],
    after: [
      "{",
      '  "name": "my-app",',
      '  "version": "1.0.0",',
      '  "private": true,',
      '  "engines": {',
      '    "node": ">=18.0.0"',
      "  },",
      '  "scripts": {',
      '    "start": "node dist/server.js",',
      '    "build": "tsc"',
      "  },",
      '  "dependencies": {',
      '    "express": "^4.18.2"',
      "  }",
      "}",
    ],
    highlightLine: 3,
    fixed: false,
  },
];

export interface Category {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  checks: number;
  passed: number;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: "env",   label: "Environment",  status: "fail", checks: 8,  passed: 6,  color: "#a78bfa" },
  { id: "deps",  label: "Dependencies", status: "warn", checks: 12, passed: 10, color: "#fb923c" },
  { id: "rt",    label: "Runtime",      status: "warn", checks: 6,  passed: 5,  color: "#5b7fff" },
  { id: "build", label: "Build",        status: "pass", checks: 9,  passed: 9,  color: "#10e8a0" },
  { id: "conf",  label: "Config",       status: "pass", checks: 7,  passed: 7,  color: "#f472b6" },
];

export const SCAN_FILES = [
  "package.json", "server.js", ".env", ".env.example",
  "src/index.ts", "src/db/connection.ts", "src/routes/api.ts",
  "src/routes/health.ts", "src/middleware/auth.ts", "src/middleware/cors.ts",
  "src/utils/logger.ts", "src/config/index.ts", "src/models/user.ts",
  "src/controllers/health.ts", "tsconfig.json", "Dockerfile",
  ".dockerignore", ".eslintrc.json", "jest.config.ts", "README.md",
];

export const SCAN_STAGES = [
  { id: "init",    label: "Initialising scanner",          duration: 550 },
  { id: "env",     label: "Parsing environment config",    duration: 800 },
  { id: "deps",    label: "Resolving dependency graph",    duration: 900 },
  { id: "runtime", label: "Running runtime analysis",      duration: 850 },
  { id: "build",   label: "Inspecting build pipeline",     duration: 700 },
  { id: "conf",    label: "Cross-referencing deploy rules",duration: 800 },
  { id: "report",  label: "Generating audit report",       duration: 550 },
];
