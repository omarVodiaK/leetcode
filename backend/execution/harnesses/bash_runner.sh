#!/bin/bash
# Bash test harness — injected into execution container.
# Reads test cases from /runner/tests.json, runs user script with each input,
# prints results as JSON to stdout.

set -euo pipefail

SOLUTION="/code/solution.sh"
chmod +x "$SOLUTION"

result="["
first=true

while IFS= read -r test_json; do
    id=$(echo "$test_json" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['id'])")
    input=$(echo "$test_json" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['input'])")
    expected=$(echo "$test_json" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['expected_output'])")

    start_ms=$(($(date +%s%N)/1000000))
    actual=$(echo "$input" | bash "$SOLUTION" 2>&1) || true
    end_ms=$(($(date +%s%N)/1000000))
    elapsed=$((end_ms - start_ms))

    actual_trimmed=$(echo "$actual" | xargs echo -n 2>/dev/null || echo "$actual")
    expected_trimmed=$(echo "$expected" | xargs echo -n 2>/dev/null || echo "$expected")

    if [ "$actual_trimmed" = "$expected_trimmed" ]; then
        passed="true"
    else
        passed="false"
    fi

    actual_json=$(echo "$actual" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read().strip()))")
    entry="{\"test_case_id\":$id,\"passed\":$passed,\"actual_output\":$actual_json,\"runtime_ms\":$elapsed}"

    if [ "$first" = true ]; then
        result="$result$entry"
        first=false
    else
        result="$result,$entry"
    fi
done < <(python3 -c "import json; [print(json.dumps(t)) for t in json.load(open('/runner/tests.json'))]")

result="$result]"
echo "$result"
