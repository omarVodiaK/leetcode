# SRE Interview Trainer — Design Spec

**Date:** 2026-04-24  
**Status:** Approved  

---

## Overview

A localhost-first, LeetCode-style web app for practicing SRE coding interview questions. Users write Python, Bash, or Go solutions in a browser-based code editor; submissions are executed in isolated Docker containers and results are shown inline with per-test-case pass/fail feedback. The app ships with a pre-built bank of ~30 SRE-focused coding problems and can be shared by cloning the repo and running `docker compose up`.

---

## Scope (v1)

**In scope:**
- Coding challenges only (Python, Bash, Go)
- Pre-built question bank (~30 questions)
- Docker-based sandboxed code execution
- LeetCode-style split-pane UI with Monaco editor
- Per-test-case pass/fail results (hidden test cases show result only, not input/expected)
- Progress tracking via browser localStorage (no auth)
- Shareable via git clone + `docker compose up`

**Out of scope (v1):**
- Incident response / system design / troubleshooting non-coding question types
- AI-generated question generation
- User accounts or persistent server-side progress
- Deployment to cloud / public hosting

---

## Architecture

```
Browser (localhost:3000)
  └── React + Monaco Editor
        │ HTTP REST
FastAPI Backend (localhost:8000)
  └── Docker SDK
        └── Execution Containers (per submission)
              - python:3.12-slim
              - alpine (bash)
              - golang:1.22-alpine
```

Everything is orchestrated by `docker compose`. The backend service has access to the host Docker socket to spin up ephemeral execution containers per submission.

---

## Component Breakdown

### 1. Frontend (React + Vite)

**Pages:**
- `/` — Question list with filter by difficulty/category and solve status
- `/problem/:id` — Split-pane problem view

**Question List features:**
- Table columns: Title, Difficulty (Easy/Medium/Hard badge), Category tag, Languages, Status (Not Started / Attempted / Solved)
- Filter controls: difficulty dropdown, category dropdown
- Status stored in `localStorage`

**Problem View features:**
- Left pane: problem description, constraints, visible examples
- Right pane: Monaco code editor with language selector (Python/Bash/Go), Run and Submit buttons
- Bottom panel: test results after run/submit
- "Run" executes visible test cases only; "Submit" runs all test cases including hidden ones

**Tech stack:**
- React 18 + Vite
- Monaco Editor (`@monaco-editor/react`)
- TailwindCSS for styling
- Axios for API calls

---

### 2. Backend (FastAPI)

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/questions` | List all questions (id, title, difficulty, category, languages) |
| GET | `/questions/:id` | Full question detail (description, starter code, visible test cases) |
| POST | `/submit` | Run submission against test cases in Docker |

**Submit request body:**
```json
{
  "question_id": "sre-001",
  "language": "python",
  "code": "def parse_logs(log_content):\n    ...",
  "mode": "run"  // "run" (visible tests only) or "submit" (all tests)
}
```

**Submit response body:**
```json
{
  "status": "partial",  // "accepted", "partial", "wrong_answer", "time_limit_exceeded", "runtime_error"
  "results": [
    {
      "test_case_id": 1,
      "description": "Basic log with 3 IPs",
      "passed": true,
      "runtime_ms": 120,
      "hidden": false,
      "actual_output": "[('192.168.1.1', 10)]",
      "expected_output": "[('192.168.1.1', 10)]"
    },
    {
      "test_case_id": 2,
      "description": "Hidden edge case",
      "passed": false,
      "runtime_ms": 85,
      "hidden": true,
      "actual_output": null,
      "expected_output": null
    }
  ],
  "total": 4,
  "passed": 3
}
```

**Tech stack:**
- Python 3.12 + FastAPI + Uvicorn
- Docker SDK for Python (`docker` package)
- Questions loaded from JSON files at startup

---

### 3. Code Execution Sandbox

Each submission triggers the backend to:

1. Write user code + a test runner harness to a temp directory
2. Spin up a Docker container with that directory bind-mounted read-only to `/code`
3. Run the test harness, capture stdout/stderr
4. Parse results and return to the API caller
5. Remove the container

**Security constraints per container:**
- No network access (`--network none`)
- Read-only filesystem except `/tmp`
- Memory limit: 256MB
- CPU limit: 0.5 cores
- Hard timeout: 10 seconds (container killed after)
- Non-root user inside container

**Language-specific harness:**

- **Python:** a `runner.py` script imports the user's solution module and calls each test function, capturing return values and comparing to expected
- **Bash:** the user's script is sourced or piped stdin; a wrapper script captures stdout and compares to expected
- **Go:** the user's code is compiled with `go build` inside the container; binary is run per test case

---

### 4. Question Bank

Questions are stored as JSON files in `backend/questions/`. Each file follows this schema:

```json
{
  "id": "sre-001",
  "title": "Parse Nginx Access Logs",
  "difficulty": "easy",
  "category": "log-parsing",
  "tags": ["logs", "parsing", "regex"],
  "languages": ["python", "bash"],
  "description": "Markdown string describing the problem...",
  "constraints": ["Log entries follow Combined Log Format", "Return list sorted by count descending"],
  "examples": [
    {
      "input": "192.168.1.1 - - [10/Oct/2024] \"GET /index.html\" 200 1234\n...",
      "output": "[('192.168.1.1', 3)]",
      "explanation": "IP 192.168.1.1 appears 3 times"
    }
  ],
  "starter_code": {
    "python": "def parse_logs(log_content: str) -> list[tuple]:\n    pass\n",
    "bash": "#!/bin/bash\n# Read log content from stdin\n"
  },
  "test_cases": [
    {
      "id": 1,
      "description": "Basic log with 3 IPs",
      "input": "...",
      "expected_output": "[('192.168.1.1', 3)]",
      "hidden": false
    },
    {
      "id": 2,
      "description": "Edge case: empty log",
      "input": "",
      "expected_output": "[]",
      "hidden": true
    }
  ]
}
```

**Initial question categories (~30 total):**
- Log parsing & analysis (8 questions)
- Metrics & alerting scripts (6 questions)
- Incident automation (6 questions)
- Infrastructure scripting — disk, processes, health checks (6 questions)
- Go concurrency — rate limiters, worker pools (4 questions)

---

### 5. Progress Tracking

Stored entirely in `localStorage` under key `sre-trainer-progress`:

```json
{
  "sre-001": "solved",
  "sre-002": "attempted",
  "sre-003": "not_started"
}
```

Updated when a submission returns status `accepted` (→ solved) or any other result (→ attempted).

---

## Project Structure

```
leetcode/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                  # FastAPI app
│   ├── execution/
│   │   ├── runner.py            # Docker execution orchestration
│   │   └── harnesses/           # Per-language test runner scripts
│   │       ├── python_runner.py
│   │       ├── bash_runner.sh
│   │       └── go_runner.go
│   └── questions/               # JSON question files
│       ├── sre-001.json
│       └── ...
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── pages/
│       │   ├── QuestionList.tsx
│       │   └── ProblemView.tsx
│       ├── components/
│       │   ├── CodeEditor.tsx
│       │   ├── TestResults.tsx
│       │   └── DifficultyBadge.tsx
│       └── api/
│           └── client.ts
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-04-24-sre-interview-trainer-design.md
```

---

## Docker Compose Setup

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock  # access Docker daemon
      - ./backend/questions:/app/questions
    environment:
      - PYTHONUNBUFFERED=1

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:8000
```

---

## Getting Started (README summary)

```bash
git clone <repo>
cd leetcode
docker compose up
# Open http://localhost:3000
```

Requirements: Docker Desktop (or Docker Engine + Compose plugin).

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Syntax error in submitted code | Runtime error captured, shown to user with stderr |
| Infinite loop / timeout | Container killed after 10s, "Time Limit Exceeded" shown |
| Container fails to start | API returns 500 with user-friendly message |
| Question not found | API returns 404 |
| Unsupported language for question | Frontend disables the language selector option |
