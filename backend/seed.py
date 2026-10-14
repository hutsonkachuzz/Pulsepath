import os
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal, init_db
from backend.app.core.security import get_password_hash
from backend.app.models.user import User
from backend.app.models.couple import Couple
from backend.app.models.memory import Memory
from backend.app.models.message import Message
from backend.app.models.thought import LoveThought
from backend.app.models.letter import LoveLetter
from backend.app.models.date import SpecialDate
from backend.app.models.mood import Mood
from backend.app.models.daily import DailyQuestion, DailyAnswer
from backend.app.models.reminder import Reminder

def seed_demo_data():
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        couple = db.query(Couple).filter(Couple.couple_code == "PULSE-7K29").first()
        if couple:
            return

        print("Seeding initial PulsePath demo data...")

        # Create Eren & Mikasa
        eren = User(
            id="user_eren_101",
            email="eren@pulsepath.love",
            hashed_password=get_password_hash("demo1234"),
            name="Eren",
            nickname="Eren ❤️",
            avatar="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
            couple_id="demo_couple_123",
            dob="1998-05-14",
            created_at=datetime.utcnow()
        )
        mikasa = User(
            id="user_mikasa_202",
            email="mikasa@pulsepath.love",
            hashed_password=get_password_hash("demo1234"),
            name="Mikasa",
            nickname="Mikasa ❤️",
            avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
            couple_id="demo_couple_123",
            dob="1999-10-22",
            created_at=datetime.utcnow()
        )
        db.add_all([eren, mikasa])
        db.commit()

        # Couple Space
        couple = Couple(
            id="demo_couple_123",
            couple_code="PULSE-7K29",
            user_one_id="user_eren_101",
            user_two_id="user_mikasa_202",
            user_one_name="Eren",
            user_two_name="Mikasa",
            nickname="Eren & Mikasa's Universe",
            description="Two hearts beating as one across all the stars.",
            relationship_start_date="2022-09-15T00:00:00.000Z",
            created_at=datetime.utcnow()
        )
        db.add(couple)
        db.commit()

        # Initial Memories
        memories = [
            Memory(
                couple_id="demo_couple_123",
                created_by="user_eren_101",
                author_name="Eren",
                title="Our Sunset Picnic at Sunset Cliffs",
                description="We sat on the blanket watching the Pacific sky catch fire in shades of crimson and violet. You laughed at the seagull trying to steal our pastries, and right then I knew I was looking at my entire future.",
                date="2023-08-24",
                location="Sunset Cliffs, San Diego",
                mood="Romantic",
                mood_emoji="🥰",
                tags=["Sunset", "Beach", "Picnic", "GoldenHour"],
                images=[
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
                    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1000&q=80"
                ],
                is_favorite=True,
                created_at=datetime.utcnow()
            ),
            Memory(
                couple_id="demo_couple_123",
                created_by="user_mikasa_202",
                author_name="Mikasa",
                title="The Rainy Night in Florence",
                description="Caught under a tiny trattoria canopy during a sudden summer downpour. The scent of rain, warm espresso, and your jacket wrapped around my shoulders.",
                date="2023-11-04",
                location="Florence, Italy",
                mood="Nostalgic",
                mood_emoji="✨",
                tags=["Italy", "Rain", "Coffee", "Travel"],
                images=[
                    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=80"
                ],
                is_favorite=True,
                created_at=datetime.utcnow()
            )
        ]
        db.add_all(memories)

        # Initial Messages
        messages = [
            Message(
                couple_id="demo_couple_123",
                sender_id="user_eren_101",
                sender_name="Eren",
                content="Good morning my heart ❤️ Just saw the sunrise and thought of your smile.",
                reactions={"❤️": ["user_mikasa_202"], "🥰": ["user_eren_101"]},
                is_saved_as_memory=False,
                created_at=datetime.utcnow()
            ),
            Message(
                couple_id="demo_couple_123",
                sender_id="user_mikasa_202",
                sender_name="Mikasa",
                content="Good morning baby! You make every day feel like poetry ✨ Can't wait for our walk tonight.",
                reactions={"❤️": ["user_eren_101"]},
                is_saved_as_memory=True,
                created_at=datetime.utcnow()
            )
        ]
        db.add_all(messages)

        # Initial Love Thoughts
        thoughts = [
            LoveThought(
                couple_id="demo_couple_123",
                created_by="user_eren_101",
                author_name="Eren",
                content="I don't always say it out loud, but every quiet moment with you feels like home.",
                visibility="shared",
                is_favorite=True,
                created_at=datetime.utcnow()
            ),
            LoveThought(
                couple_id="demo_couple_123",
                created_by="user_mikasa_202",
                author_name="Mikasa",
                content="In a world full of temporary noise, you are my forever melody.",
                visibility="shared",
                is_favorite=True,
                created_at=datetime.utcnow()
            )
        ]
        db.add_all(thoughts)

        # Initial Love Letters
        letters = [
            LoveLetter(
                couple_id="demo_couple_123",
                created_by="user_eren_101",
                author_name="Eren",
                title="To the One Who Turned Ordinary Days into Magic",
                content="Mikasa,\n\nBefore you, days were just dates on a calendar. You showed up with your gentle eyes, your infectious laugh, and suddenly the simplest things—getting coffee, sitting in silence, riding the late evening train—became holy.\n\nThank you for choosing me every single day. I will spend all of mine making sure you know you are loved.\n\nForever yours,\nEren",
                visibility="shared",
                opened_at=None,
                created_at=datetime.utcnow()
            )
        ]
        db.add_all(letters)

        # Special Dates
        dates = [
            SpecialDate(
                couple_id="demo_couple_123",
                title="Our 4th Anniversary ❤️",
                date="2026-09-15T18:00:00.000Z",
                category="anniversary",
                description="Rooftop dinner reservation and revisiting our favorite pier.",
                reminder_enabled=True,
                created_at=datetime.utcnow()
            ),
            SpecialDate(
                couple_id="demo_couple_123",
                title="Mikasa's Birthday 🎂",
                date="2026-10-22T00:00:00.000Z",
                category="birthday",
                description="Surprise weekend getaway into the mountains.",
                reminder_enabled=True,
                created_at=datetime.utcnow()
            )
        ]
        db.add_all(dates)

        # Initial Moods
        moods = [
            Mood(
                couple_id="demo_couple_123",
                user_id="user_eren_101",
                mood="Loved",
                emoji="❤️",
                note="Counting down the hours until I see you.",
                updated_at=datetime.utcnow()
            ),
            Mood(
                couple_id="demo_couple_123",
                user_id="user_mikasa_202",
                mood="Happy",
                emoji="😊",
                note="Listening to our playlist and smiling.",
                updated_at=datetime.utcnow()
            )
        ]
        db.add_all(moods)

        # Daily Question
        today = datetime.utcnow().strftime("%Y-%m-%d")
        daily_q = DailyQuestion(
            date=today,
            question_text="What was your favorite little moment with me this week?",
            created_at=datetime.utcnow()
        )
        db.add(daily_q)
        db.commit()

        # Reminders for Eren & Mikasa
        r1 = Reminder(
            user_id="user_eren_101",
            morning_time="08:00",
            morning_msg="Good morning ❤️ It's time to wake up. Your favorite person is waiting for another beautiful day with you.",
            bedtime_time="23:15",
            bedtime_msg="Good night ❤️ Close your eyes and rest. Tomorrow we create another memory.",
            created_at=datetime.utcnow()
        )
        r2 = Reminder(
            user_id="user_mikasa_202",
            morning_time="08:00",
            morning_msg="Good morning ❤️ It's time to wake up. Your favorite person is waiting for another beautiful day with you.",
            bedtime_time="23:15",
            bedtime_msg="Good night ❤️ Close your eyes and rest. Tomorrow we create another memory.",
            created_at=datetime.utcnow()
        )
        db.add_all([r1, r2])
        db.commit()

        print("Seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_demo_data()
