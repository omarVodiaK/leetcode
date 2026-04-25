# SRE Interview Trainer

A LeetCode-style coding practice app for SRE interview preparation.
Write Go solutions in a VS Code-quality editor, run them in isolated Docker containers, and get instant per-test-case feedback.

## Features

- **30 SRE coding challenges** across 5 categories
- **Go** — the primary SRE language at Google, Cloudflare, and beyond
- **LeetCode-style split-pane UI** — problem description + Monaco editor side by side
- **Sandboxed execution** — each submission runs in an isolated Docker container (no network, 256MB RAM limit)
- **Hidden test cases** — visible tests show expected/actual output; hidden tests show only pass/fail
- **Progress tracking** — Solved / Attempted / Not Started saved in your browser
- **Fast after warm-up** — persistent Go build cache means ~0.5s per submission after the first run

## Requirements

- Docker Desktop (Mac/Windows) or Docker Engine + Compose plugin (Linux)

## Getting Started

```bash
git clone git@github.com:omarVodiaK/leetcode.git
cd leetcode

# Create the Go build cache volume (one-time setup)
docker volume create go-build-cache

docker compose up
```

Open **http://localhost:3000**

> The first Go submission takes ~15-20s while the build cache warms up.
> Every submission after that takes ~0.5s.

## Stopping

```bash
docker compose down
```

## Question Categories

| Category | Questions | Focus |
|---|---|---|
| Log Parsing | sre-001 – sre-008 | Nginx logs, JSON logs, gaps, bursts |
| Metrics & Alerting | sre-009 – sre-014 | Error rates, P95, SLOs, moving averages |
| Incident Automation | sre-015 – sre-020 | On-call, timelines, runbooks, MTTR |
| Infrastructure Scripting | sre-021 – sre-026 | Disk, processes, k8s, cron, config diff |
| Go Concurrency | sre-027 – sre-030 | Goroutines, channels, rate limiting, timeouts |

## Solution Format

All questions use Go. Your `solve` function receives the full input as a single string and must return a string matching the expected output exactly.

```go
package main

import "strings"

func solve(input string) string {
    lines := strings.Split(strings.TrimSpace(input), "\n")
    _ = lines
    return ""
}
```

## Adding Questions

Add a JSON file to `backend/questions/` with this structure:

```json
{
  "id": "sre-031",
  "title": "My Question",
  "difficulty": "easy",
  "category": "log-parsing",
  "tags": ["logs"],
  "languages": ["go"],
  "description": "...",
  "constraints": ["..."],
  "examples": [{ "input": "...", "output": "...", "explanation": "..." }],
  "starter_code": {
    "go": "package main\n\nfunc solve(input string) string {\n\treturn \"\"\n}\n"
  },
  "test_cases": [
    { "id": 1, "description": "basic", "input": "...", "expected_output": "...", "hidden": false },
    { "id": 2, "description": "hidden", "input": "...", "expected_output": "...", "hidden": true }
  ]
}
```

Restart the backend to pick up new questions: `docker compose restart backend`
