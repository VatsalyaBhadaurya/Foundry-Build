# Contributing to FoundryBuild AI

Thank you for your interest in contributing. Here's how to get started.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/Foundry-Build.git`
3. Create a branch: `git checkout -b feat/your-feature`

## Project Structure

```
/                   Next.js 16 frontend (App Router)
backend/            FastAPI backend
  agents/           12 specialized AI agents
  api/v1/           REST + SSE endpoints
  shared/           Schemas, LLM client, DB
components/         React components
app/                Next.js pages
```

## Development Setup

**Frontend**
```bash
npm install
npm run dev
```

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill in your API keys
uvicorn main:app --reload
```

## Environment Variables

Copy `backend/.env.example` and fill in:
- `GEMINI_API_KEY` — Google Gemini API key
- `GITHUB_TOKEN` — GitHub personal access token (for GitHubAgent)
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis

Never commit real API keys. The `.gitignore` blocks `.env` files.

## Submitting Changes

- Keep PRs focused — one feature or fix per PR
- Run `npm run build` (frontend) and ensure no TypeScript errors before opening a PR
- Write a clear PR description: what changed, why, and how to test it
- Reference any related issues with `Closes #<issue>`

## Adding a New Agent

1. Create `backend/agents/<name>/agent.py` and `__init__.py`
2. Extend `BaseAgent`, implement `async def run(self, input_data) -> OutputSchema`
3. Add the output schema to `shared/schemas.py`
4. Wire it into `backend/api/v1/endpoints/orchestrate.py` (phase 1, 2, or 3)
5. Render its output in `backend/api/v1/endpoints/export.py`
6. Display it in `components/studio/BlueprintPanel.tsx`

## Code Style

- TypeScript: strict mode, no `any`
- Python: follow existing patterns — `async/await`, Pydantic v2, `call_llm` / `call_llm_text`
- No commented-out code
- No unnecessary console.log / print statements in production paths

## Reporting Issues

Use GitHub Issues. For bugs, include steps to reproduce, expected behavior, and actual behavior.
