from strands import Agent
from strands.models.ollama import OllamaModel


ollama_model = OllamaModel(
    host="http://localhost:11434",
    model_id="qwen2.5:3b",
    temperature=0.3,
)

def analyze_issues(
    issues: list[dict],
    project_type: list[str] | None = None,
) -> str:
    """
    Use a local Ollama model (via Strands Agents) to analyze audit issues.
    """

    if not issues:
        return "No deployment issues were detected."

    project_type_text = ", ".join(
        project_type or ["unknown"]
    )

    prompt = f"""
You are DevPilot, a deployment safety assistant.

Project type:
{project_type_text}

Audit issues:
{issues}

Analyze these issues and produce a concise deployment audit report.

For each issue:
1. Explain why it matters.
2. Explain the possible deployment impact.
3. Give a practical fix.

Prioritize critical and high-severity issues first.
Keep the response developer-friendly.
"""

    agent = Agent(model=ollama_model)
    response = agent(prompt)

    return str(response)