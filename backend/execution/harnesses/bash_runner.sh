#!/bin/bash
# Bash test harness — injected into execution container.
# Reads test cases from /runner/tests.json, runs user script with each input,
# prints results as JSON to stdout.

set -uo pipefail

SOLUTION="/code/solution.sh"
chmod +x "$SOLUTION"

python3 - <<'PYEOF'
import json
import subprocess
import time

with open('/runner/tests.json') as f:
    tests = json.load(f)

results = []
for test in tests:
    start = time.monotonic()
    try:
        proc = subprocess.run(
            ['bash', '/code/solution.sh'],
            input=test['input'],
            capture_output=True,
            text=True,
            timeout=8,
        )
        actual = proc.stdout.strip()
        if proc.returncode != 0 and not actual:
            actual = proc.stderr.strip() or f"Exit code {proc.returncode}"
    except subprocess.TimeoutExpired:
        actual = "Time Limit Exceeded"
    except Exception as e:
        actual = f"RuntimeError: {e}"
    elapsed = int((time.monotonic() - start) * 1000)
    results.append({
        'test_case_id': test['id'],
        'passed': actual == str(test['expected_output']).strip(),
        'actual_output': actual,
        'runtime_ms': elapsed,
    })

print(json.dumps(results))
PYEOF
