import pytest
from pathlib import Path
from question_loader import QuestionLoader


FIXTURES_DIR = Path(__file__).parent / "fixtures"


def test_load_questions_from_directory():
    loader = QuestionLoader(FIXTURES_DIR)
    questions = loader.list_all()
    assert len(questions) == 1
    assert questions[0].id == "test-001"
    assert questions[0].title == "Test Question"


def test_get_question_by_id():
    loader = QuestionLoader(FIXTURES_DIR)
    question = loader.get("test-001")
    assert question is not None
    assert question.difficulty == "easy"
    assert len(question.test_cases) == 2


def test_get_unknown_question_returns_none():
    loader = QuestionLoader(FIXTURES_DIR)
    assert loader.get("does-not-exist") is None


def test_question_has_starter_code():
    loader = QuestionLoader(FIXTURES_DIR)
    question = loader.get("test-001")
    assert "python" in question.starter_code
    assert "pass" in question.starter_code["python"]
