from __future__ import annotations
import io
import json
import shutil
import tarfile
import tempfile
from pathlib import Path

import docker
import requests
from docker.errors import APIError

from models import Question, TestCase

HARNESSES_DIR = Path(__file__).parent / "harnesses"

LANGUAGE_IMAGES = {
    "python": "python:3.12-slim",
    "bash": "alpine:3.19",
    "go": "golang:1.22-alpine",
}

TIMEOUT_SECONDS = 10
TIMEOUT_GO = 60          # go run compiles before executing — needs more time
MEMORY_LIMIT = "256m"
CPU_QUOTA = 50000  # 0.5 CPU cores (100000 = 1 core)


def _make_tar(files: dict[str, str | bytes]) -> bytes:
    """Build an in-memory tar archive.

    Keys are full relative paths (e.g. 'code/solution.py', 'runner/tests.json').
    Intermediate directories are created automatically.
    """
    buf = io.BytesIO()
    created_dirs: set[str] = set()

    with tarfile.open(fileobj=buf, mode="w") as tf:
        for path, content in files.items():
            # Ensure parent directories exist as tar entries
            parts = path.split("/")
            for i in range(1, len(parts)):
                dir_path = "/".join(parts[:i])
                if dir_path not in created_dirs:
                    dir_info = tarfile.TarInfo(name=dir_path)
                    dir_info.type = tarfile.DIRTYPE
                    dir_info.mode = 0o755
                    tf.addfile(dir_info)
                    created_dirs.add(dir_path)

            data = content if isinstance(content, bytes) else content.encode("utf-8")
            info = tarfile.TarInfo(name=path)
            info.size = len(data)
            info.mode = 0o755
            tf.addfile(info, io.BytesIO(data))

    return buf.getvalue()


class DockerRunner:
    def __init__(self):
        self._client = docker.DockerClient(base_url="unix:///var/run/docker.sock")

    def run(
        self,
        question: Question,
        language: str,
        code: str,
        test_cases: list[TestCase],
    ) -> list[dict]:
        if language not in LANGUAGE_IMAGES:
            raise ValueError(f"Unsupported language: {language}")

        code_files = self._build_code_files(language, code)
        runner_files = self._build_runner_files(language, test_cases)

        return self._execute(language, code_files, runner_files, test_cases)

    def _build_code_files(self, language: str, code: str) -> dict[str, str]:
        extensions = {"python": "solution.py", "bash": "solution.sh", "go": "solution.go"}
        return {extensions[language]: code}

    def _build_runner_files(self, language: str, test_cases: list[TestCase]) -> dict[str, str]:
        tests_json = json.dumps([
            {"id": tc.id, "input": tc.input, "expected_output": tc.expected_output}
            for tc in test_cases
        ])
        files: dict[str, str] = {"tests.json": tests_json}

        if language == "python":
            files["runner.py"] = (HARNESSES_DIR / "python_runner.py").read_text()
        elif language == "bash":
            files["runner.sh"] = (HARNESSES_DIR / "bash_runner.sh").read_text()
        elif language == "go":
            files["main.go"] = (HARNESSES_DIR / "go_runner_template.go").read_text()

        return files

    def _execute(
        self,
        language: str,
        code_files: dict[str, str],
        runner_files: dict[str, str],
        test_cases: list[TestCase],
    ) -> list[dict]:
        image = LANGUAGE_IMAGES[language]
        command = self._get_command(language)
        timeout = TIMEOUT_GO if language == "go" else TIMEOUT_SECONDS

        container = None
        try:
            container = self._client.containers.create(
                image=image,
                command=command,
                network_disabled=True,
                mem_limit=MEMORY_LIMIT,
                cpu_quota=CPU_QUOTA,
            )

            # Build one archive with prefixed paths and copy it to /.
            # put_archive to an existing parent (/) avoids the "directory not found" error
            # that occurs when the destination doesn't exist yet.
            all_files = {f"code/{k}": v for k, v in code_files.items()}
            all_files.update({f"runner/{k}": v for k, v in runner_files.items()})
            container.put_archive("/", _make_tar(all_files))

            container.start()

            try:
                container.wait(timeout=timeout)
            except requests.exceptions.ReadTimeout:
                return self._timeout_results(test_cases, timeout)

            output = container.logs(stdout=True, stderr=False)
            output_str = output.decode("utf-8").strip()
            return self._parse_output(output_str, test_cases)

        except Exception as e:
            error_msg = str(e)
            if "timeout" in error_msg.lower() or "ReadTimeout" in type(e).__name__:
                return self._timeout_results(test_cases, timeout)
            return self._error_results(test_cases, error_msg[:500])
        finally:
            if container is not None:
                try:
                    container.remove(force=True)
                except Exception:
                    pass

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

    def _timeout_results(self, test_cases: list[TestCase], timeout: int = TIMEOUT_SECONDS) -> list[dict]:
        return [
            {
                "test_case_id": tc.id,
                "passed": False,
                "actual_output": "Time Limit Exceeded",
                "runtime_ms": timeout * 1000,
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
