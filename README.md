# SRE Interview Trainer

A LeetCode-style coding practice app focused on SRE interview questions.
Supports Python, Bash, and Go. Code runs in isolated Docker containers.

## Requirements

- Docker Desktop (Mac/Windows) or Docker Engine + Compose plugin (Linux)

## Getting Started

```bash
git clone <your-repo-url>
cd leetcode
docker compose up
```

Open http://localhost:3000

## Stopping

```bash
docker compose down
```

## Question Categories

- Log parsing & analysis
- Metrics & alerting scripts
- Incident automation
- Infrastructure scripting
- Go concurrency

## Adding Questions

Add a new JSON file to `backend/questions/` following the schema in
`docs/superpowers/specs/2026-04-24-sre-interview-trainer-design.md`.
