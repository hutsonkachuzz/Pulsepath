from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_couple_user
from backend.app.models.user import User
from backend.app.models.daily import DailyQuestion, DailyAnswer
from backend.app.schemas.daily import DailyAnswerCreate, DailyQuestionResponse, DailyAnswerItem

router = APIRouter(prefix="/daily", tags=["daily"])

DEFAULT_QUESTIONS = [
    "What was your favorite little moment with me this week?",
    "If we could take off to anywhere right now, where would our heart take us?",
    "What is one tiny habit of mine that secretly makes you smile?",
    "What song instantly reminds you of the way we fell in love?",
    "What is one dream you want us to accomplish together before this year ends?",
    "When did you realize that I was truly your safe home?",
    "What is your favorite memory of us on a rainy evening?"
]

@router.get("/today", response_model=DailyQuestionResponse)
def get_today_question(
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    question = db.query(DailyQuestion).filter(DailyQuestion.date == today).first()

    if not question:
        # Choose a question based on the day of the year
        day_of_year = datetime.utcnow().timetuple().tm_yday
        q_text = DEFAULT_QUESTIONS[day_of_year % len(DEFAULT_QUESTIONS)]
        question = DailyQuestion(
            date=today,
            question_text=q_text,
            created_at=datetime.utcnow()
        )
        db.add(question)
        db.commit()
        db.refresh(question)

    answers = db.query(DailyAnswer).filter(
        DailyAnswer.couple_id == current_user.couple_id,
        DailyAnswer.date == today
    ).all()

    ans_map = {}
    for a in answers:
        ans_map[a.user_id] = DailyAnswerItem(
            authorName=a.author_name,
            text=a.answer_text,
            timestamp=a.created_at.isoformat() if a.created_at else today
        )

    return DailyQuestionResponse(
        id=question.id,
        date=today,
        question=question.question_text,
        answers=ans_map
    )

@router.post("/answer", response_model=DailyQuestionResponse)
def submit_answer(
    payload: DailyAnswerCreate,
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    answer_text = payload.answer_text.strip()
    if not answer_text:
        raise HTTPException(status_code=400, detail="Answer cannot be empty")

    existing = db.query(DailyAnswer).filter(
        DailyAnswer.couple_id == current_user.couple_id,
        DailyAnswer.date == today,
        DailyAnswer.user_id == current_user.id
    ).first()

    if existing:
        existing.answer_text = answer_text
    else:
        new_answer = DailyAnswer(
            couple_id=current_user.couple_id,
            date=today,
            user_id=current_user.id,
            author_name=current_user.name,
            answer_text=answer_text,
            created_at=datetime.utcnow()
        )
        db.add(new_answer)

    db.commit()
    return get_today_question(current_user=current_user, db=db)
