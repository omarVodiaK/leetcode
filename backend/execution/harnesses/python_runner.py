#!/usr/bin/env python3
"""
Python test harness — injected into execution container.
Reads test cases from /runner/tests.json, imports user solution,
prints results as JSON to stdout.
"""
import json
import sys
import time
import importlib.util
from pathlib import Path


def load_solution():
    spec = importlib.util.spec_from_file_location("solution", "/code/solution.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def run_tests(tests: list[dict]) -> list[dict]:
    try:
        solution = load_solution()
    except Exception as e:
        return [
            {
                "test_case_id": t["id"],
                "passed": False,
                "actual_output": f"ImportError: {e}",
                "runtime_ms": 0,
                "error": str(e),
            }
            for t in tests
        ]

    results = []
    for test in tests:
        start = time.monotonic()
        try:
            # Call the first non-private function defined in the solution module
            func_name = [
                name for name in dir(solution)
                if callable(getattr(solution, name)) and not name.startswith("_")
            ][0]
            func = getattr(solution, func_name)
            actual = str(func(test["input"]))
        except Exception as e:
            actual = f"RuntimeError: {e}"
        elapsed = int((time.monotonic() - start) * 1000)
        results.append({
            "test_case_id": test["id"],
            "passed": actual.strip() == str(test["expected_output"]).strip(),
            "actual_output": actual,
            "runtime_ms": elapsed,
        })
    return results


if __name__ == "__main__":
    tests_path = Path("/runner/tests.json")
    tests = json.loads(tests_path.read_text())
    results = run_tests(tests)
    print(json.dumps(results))
