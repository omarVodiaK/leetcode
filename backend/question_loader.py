from pathlib import Path
import json
from models import Question, QuestionSummary


class QuestionLoader:
    def __init__(self, questions_dir: Path):
        self._dir = questions_dir
        self._cache: dict[str, Question] = {}
        self._load_all()

    def _load_all(self) -> None:
        for path in sorted(self._dir.glob("*.json")):
            with path.open() as f:
                data = json.load(f)
            question = Question(**data)
            self._cache[question.id] = question

    def list_all(self) -> list[QuestionSummary]:
        return [
            QuestionSummary(
                id=q.id,
                title=q.title,
                difficulty=q.difficulty,
                category=q.category,
                tags=q.tags,
                languages=q.languages,
                priority=q.priority,
            )
            for q in sorted(self._cache.values(), key=lambda q: (q.priority, q.id))
        ]

    def get(self, question_id: str) -> Question | None:
        return self._cache.get(question_id)
