const API_URL = "http://localhost:8000";

export async function testBackend() {
  const response = await fetch(`${API_URL}/api/test`);

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  return response.json();
}

export interface AuditIssue {
  rule_id: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  file: string | null;
  line: number | null;
  fix: string | null;
}

export interface AuditResponse {
  status: string;
  project_path: string;
  project_types: string[];
  files_scanned: number;
  issues_found: number;
  issues: AuditIssue[];
}

export async function runAudit(
  projectPath: string
): Promise<AuditResponse> {
  const response = await fetch(`${API_URL}/api/audit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      project_path: projectPath,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Audit failed: ${response.status} ${error}`
    );
  }

  return response.json();
}
export async function uploadProject(
  files: File[]
): Promise<AuditResponse> {
  const ignoredDirectories = [
    "node_modules",
    ".git",
    ".venv",
    "venv",
    "__pycache__",
    "dist",
    "build",
  ];

  const formData = new FormData();

  const usefulFiles = files.filter((file) => {
    const path = (
      file.webkitRelativePath || file.name
    ).replace(/\\/g, "/");

    return !path
      .split("/")
      .some((part) =>
        ignoredDirectories.includes(part)
      );
  });

  console.log(
    "Files selected:",
    files.length
  );

  console.log(
    "Files uploaded:",
    usefulFiles.length
  );

  for (const file of usefulFiles) {
    const relativePath =
      file.webkitRelativePath || file.name;

    formData.append(
      "files",
      file,
      relativePath
    );
  }

  if (usefulFiles.length === 0) {
    throw new Error("No usable project files found");
  }

  const response = await fetch(
    `${API_URL}/api/audit/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
  throw new Error(
    `Audit failed: ${response.status}`
  );
}

const data = await response.json();

console.log("AUDIT RESPONSE:", data);

return data;
}