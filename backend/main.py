from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import QuestionSummary, Question, SubmitRequest, SubmitResponse, TestResult
from question_loader import QuestionLoader
from execution.runner import DockerRunner

QUESTIONS_DIR = Path(__file__).parent / "questions"

app = FastAPI(title="SRE Interview Trainer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

loader = QuestionLoader(QUESTIONS_DIR)
runner = DockerRunner()


@app.get("/questions", response_model=list[QuestionSummary])
def list_questions():
    return loader.list_all()


@app.get("/questions/{question_id}", response_model=Question)
def get_question(question_id: str):
    question = loader.get(question_id)
    if question is None:
        raise HTTPException(status_code=404, detail=f"Question '{question_id}' not found")
    return question


@app.post("/submit", response_model=SubmitResponse)
def submit(req: SubmitRequest):
    question = loader.get(req.question_id)
    if question is None:
        raise HTTPException(status_code=404, detail=f"Question '{req.question_id}' not found")

    if req.language not in question.languages:
        raise HTTPException(
            status_code=400,
            detail=f"Language '{req.language}' not supported for this question"
        )

    if req.mode == "run":
        test_cases = [tc for tc in question.test_cases if not tc.hidden]
    else:
        test_cases = question.test_cases

    try:
        raw_results = runner.run(question, req.language, req.code, test_cases)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Execution backend unavailable: {e}")

    results = []
    for raw, tc in zip(raw_results, test_cases):
        results.append(TestResult(
            test_case_id=tc.id,
            description=tc.description,
            passed=raw.get("passed", False),
            runtime_ms=raw.get("runtime_ms", 0),
            hidden=tc.hidden,
            actual_output=None if tc.hidden and not raw.get("passed") else raw.get("actual_output"),
            expected_output=None if tc.hidden else tc.expected_output,
        ))

    passed_count = sum(1 for r in results if r.passed)
    total = len(results)

    if passed_count == total:
        status = "accepted"
    elif any("Time Limit" in (r.actual_output or "") for r in results):
        status = "time_limit_exceeded"
    elif any("RuntimeError" in (r.actual_output or "") for r in results):
        status = "runtime_error"
    elif passed_count > 0:
        status = "partial"
    else:
        status = "wrong_answer"

    return SubmitResponse(
        status=status,
        results=results,
        total=total,
        passed=passed_count,
    )


@app.get("/health")
def health():
    return {"status": "ok"}
