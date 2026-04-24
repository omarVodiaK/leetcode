from __future__ import annotations
import json
import shutil
import tempfile
from pathlib import Path

import docker
from docker.errors import APIError

from models import Question, TestCase

HARNESSES_DIR = Path(__file__).parent / "harnesses"

LANGUAGE_IMAGES = {
    "python": "python:3.12-slim",
    "bash": "alpine:3.19",
    "go": "golang:1.22-alpine",
}

TIMEOUT_SECONDS = 10
MEMORY_LIMIT = "256m"
CPU_QUOTA = 50000  # 0.5 CPU cores (100000 = 1 core)


class DockerRunner:
    def __init__(self):
        self._client = docker.from_env()

    def run(
        self,
        question: Question,
        language: str,
        code: str,
        test_cases: list[TestCase],
    ) -> list[dict]:
        if language not in LANGUAGE_IMAGES:
            raise ValueError(f"Unsupported language: {language}")

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            code_dir = tmp / "code"
            runner_dir = tmp / "runner"
            code_dir.mkdir()
            runner_dir.mkdir()

            self._write_code(language, code, code_dir)
            self._write_harness(language, runner_dir)
            self._write_tests(test_cases, runner_dir)

            return self._execute(language, code_dir, runner_dir, test_cases)

    def _write_code(self, language: str, code: str, code_dir: Path) -> None:
        extensions = {"python": "solution.py", "bash": "solution.sh", "go": "solution.go"}
        (code_dir / extensions[language]).write_text(code)

    def _write_harness(self, language: str, runner_dir: Path) -> None:
        if language == "python":
            shutil.copy(HARNESSES_DIR / "python_runner.py", runner_dir / "runner.py")
        elif language == "bash":
            shutil.copy(HARNESSES_DIR / "bash_runner.sh", runner_dir / "runner.sh")
        elif language == "go":
            shutil.copy(HARNESSES_DIR / "go_runner_template.go", runner_dir / "main.go")

    def _write_tests(self, test_cases: list[TestCase], runner_dir: Path) -> None:
        tests_data = [
            {
                "id": tc.id,
                "input": tc.input,
                "expected_output": tc.expected_output,
            }
            for tc in test_cases
        ]
        (runner_dir / "tests.json").write_text(json.dumps(tests_data))

    def _execute(
        self,
        language: str,
        code_dir: Path,
        runner_dir: Path,
        test_cases: list[TestCase],
    ) -> list[dict]:
        image = LANGUAGE_IMAGES[language]
        command = self._get_command(language)

        try:
            output = self._client.containers.run(
                image=image,
                command=command,
                volumes={
                    str(code_dir): {"bind": "/code", "mode": "ro"},
                    str(runner_dir): {"bind": "/runner", "mode": "ro"},
                },
                network_disabled=True,
                mem_limit=MEMORY_LIMIT,
                cpu_quota=CPU_QUOTA,
                remove=True,
                stdout=True,
                stderr=True,
                detach=False,
            )
            output_str = output.decode("utf-8").strip()
            return self._parse_output(output_str, test_cases)
        except Exception as e:
            error_msg = str(e)
            if "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
                return self._timeout_results(test_cases)
            return self._error_results(test_cases, error_msg[:500])

    def _get_command(self, language: str) -> str:
        if language == "python":
            return "python3 /runner/runner.py"
        elif language == "bash":
            return "sh /runner/runner.sh"
        elif language == "go":
            return (
                "sh -c 'mkdir -p /tmp/build && "
                "cp /runner/main.go /tmp/build/ && "
                "cp /code/solution.go /tmp/build/ && "
                "cd /tmp/build && "
                "go run main.go solution.go'"
            )
        raise ValueError(f"No command for language: {language}")

    def _parse_output(self, output: str, test_cases: list[TestCase]) -> list[dict]:
        for line in reversed(output.strip().split("\n")):
            line = line.strip()
            if line.startswith("["):
                try:
                    return json.loads(line)
                except json.JSONDecodeError:
                    continue
        return self._error_results(test_cases, f"Could not parse output: {output[:200]}")

    def _timeout_results(self, test_cases: list[TestCase]) -> list[dict]:
        return [
            {
                "test_case_id": tc.id,
                "passed": False,
                "actual_output": "Time Limit Exceeded",
                "runtime_ms": TIMEOUT_SECONDS * 1000,
            }
            for tc in test_cases
        ]

    def _error_results(self, test_cases: list[TestCase], error: str) -> list[dict]:
        return [
            {
                "test_case_id": tc.id,
                "passed": False,
                "actual_output": f"RuntimeError: {error}",
                "runtime_ms": 0,
            }
            for tc in test_cases
        ]
