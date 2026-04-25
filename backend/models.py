from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel


class Example(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None


class TestCase(BaseModel):
    id: int
    description: str
    input: str
    expected_output: str
    hidden: bool = False


class Question(BaseModel):
    id: str
    title: str
    difficulty: Literal["easy", "medium", "hard"]
    category: str
    tags: list[str]
    languages: list[str]
    description: str
    constraints: list[str]
    examples: list[Example]
    starter_code: dict[str, str]
    test_cases: list[TestCase]
    priority: int = 99


class QuestionSummary(BaseModel):
    id: str
    title: str
    difficulty: str
    category: str
    tags: list[str]
    languages: list[str]
    priority: int = 99


class SubmitRequest(BaseModel):
    question_id: str
    language: str
    code: str
    mode: Literal["run", "submit"]


class TestResult(BaseModel):
    test_case_id: int
    description: str
    passed: bool
    runtime_ms: int
    hidden: bool
    actual_output: Optional[str] = None
    expected_output: Optional[str] = None


class SubmitResponse(BaseModel):
    status: Literal["accepted", "partial", "wrong_answer", "time_limit_exceeded", "runtime_error"]
    results: list[TestResult]
    total: int
    passed: int
