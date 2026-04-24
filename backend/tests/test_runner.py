import pytest
from pathlib import Path
from execution.runner import DockerRunner
from models import Question, TestCase, Example


def make_question(lang: str, starter: str, test_input: str, expected: str) -> Question:
    return Question(
        id="test-runner-001",
        title="Test",
        difficulty="easy",
        category="test",
        tags=[],
        languages=[lang],
        description="Test",
        constraints=[],
        examples=[],
        starter_code={lang: starter},
        test_cases=[
            TestCase(id=1, description="basic", input=test_input,
                     expected_output=expected, hidden=False)
        ]
    )


def test_python_correct_solution():
    q = make_question(
        "python",
        "def solve(s: str) -> str:\n    return s.upper()\n",
        "hello",
        "HELLO"
    )
    runner = DockerRunner()
    results = runner.run(q, "python", q.starter_code["python"], [q.test_cases[0]])
    assert len(results) == 1
    assert results[0]["passed"] is True
    assert results[0]["actual_output"] == "HELLO"


def test_python_wrong_solution():
    q = make_question(
        "python",
        "def solve(s: str) -> str:\n    return s\n",
        "hello",
        "HELLO"
    )
    runner = DockerRunner()
    results = runner.run(q, "python", q.starter_code["python"], [q.test_cases[0]])
    assert results[0]["passed"] is False
    assert results[0]["actual_output"] == "hello"


def test_python_runtime_error():
    q = make_question(
        "python",
        "def solve(s: str) -> str:\n    raise ValueError('oops')\n",
        "hello",
        "HELLO"
    )
    runner = DockerRunner()
    results = runner.run(q, "python", q.starter_code["python"], [q.test_cases[0]])
    assert results[0]["passed"] is False
    assert "RuntimeError" in results[0]["actual_output"] or "oops" in results[0]["actual_output"]
