import asyncio
import uuid
from datetime import date, datetime
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.db.database import AsyncSessionLocal as async_session
from src.modules.admin.model import Admin
from src.modules.coach.model import Coach
from src.modules.boxer.model import Boxer
from src.modules.schedule.model import Schedule
from src.modules.session.model import Session
from src.modules.exercise.model import Exercise
from src.modules.attendance.model import Attendance
from src.modules.review.model import Review, DifficultyLevel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ─── Helpers ────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def get_or_create(db: AsyncSession, model, filters: dict, defaults: dict):
    stmt = select(model)
    for key, value in filters.items():
        stmt = stmt.where(getattr(model, key) == value)
    result = await db.execute(stmt)
    instance = result.scalars().first()
    if instance:
        return instance, False
    instance = model(**{**filters, **defaults})
    db.add(instance)
    await db.flush()
    return instance, True

# ─── Data ───────────────────────────────────────────────────────────────────

ADMIN = {
    "email": "admin@boxers.com",
    "password": "admin123"
}

COACHES = [
    {"full_name": "Carlos Mendez", "email": "carlos@boxers.com", "password": "coach123"},
    {"full_name": "Mike Johnson", "email": "mike@boxers.com", "password": "coach123"},
    {"full_name": "Sara Williams", "email": "sara@boxers.com", "password": "coach123"},
]

BOXERS_PER_COACH = [
    [
        {"first_name": "Ali", "last_name": "Hassan", "email": "ali@boxers.com", "password": "boxer123"},
        {"first_name": "John", "last_name": "Doe", "email": "john@boxers.com", "password": "boxer123"},
        {"first_name": "Marco", "last_name": "Silva", "email": "marco@boxers.com", "password": "boxer123"},
        {"first_name": "Yusuf", "last_name": "Omar", "email": "yusuf@boxers.com", "password": "boxer123"},
    ],
    [
        {"first_name": "Liam", "last_name": "Smith", "email": "liam@boxers.com", "password": "boxer123"},
        {"first_name": "Noah", "last_name": "Brown", "email": "noah@boxers.com", "password": "boxer123"},
        {"first_name": "Ethan", "last_name": "Jones", "email": "ethan@boxers.com", "password": "boxer123"},
        {"first_name": "Lucas", "last_name": "Davis", "email": "lucas@boxers.com", "password": "boxer123"},
    ],
    [
        {"first_name": "Amir", "last_name": "Khan", "email": "amir@boxers.com", "password": "boxer123"},
        {"first_name": "Diego", "last_name": "Lopez", "email": "diego@boxers.com", "password": "boxer123"},
        {"first_name": "Ivan", "last_name": "Petrov", "email": "ivan@boxers.com", "password": "boxer123"},
        {"first_name": "Karim", "last_name": "Benzid", "email": "karim@boxers.com", "password": "boxer123"},
    ],
]

SCHEDULES_PER_COACH = [
    {"name": "March Plan", "month": "2026-03"},
    {"name": "April Plan", "month": "2026-04"},
]

SESSIONS_PER_SCHEDULE = [
    {"name": "Morning Power", "session_date": date(2026, 3, 10)},
    {"name": "Cardio Blast", "session_date": date(2026, 3, 15)},
    {"name": "Technique Day", "session_date": date(2026, 3, 20)},
]

EXERCISES_PER_SESSION = [
    {"name": "Jump Rope", "description": "3 rounds of 5 minutes jump rope"},
    {"name": "Shadow Boxing", "description": "4 rounds of 3 minutes shadow boxing"},
    {"name": "Heavy Bag Work", "description": "5 rounds of 2 minutes heavy bag"},
]

DIFFICULTIES = [
    DifficultyLevel.easy,
    DifficultyLevel.medium,
    DifficultyLevel.hard,
    DifficultyLevel.very_easy,
]

# ─── Seed Functions ──────────────────────────────────────────────────────────

async def seed_admin(db: AsyncSession):
    admin, created = await get_or_create(
        db, Admin,
        filters={"email": ADMIN["email"]},
        defaults={"password": hash_password(ADMIN["password"])}
    )
    if created:
        print(f"  ✓ Admin created: {admin.email}")
    else:
        print(f"  - Admin already exists: {admin.email}")
    return admin

async def seed_coaches(db: AsyncSession):
    coaches = []
    for data in COACHES:
        coach, created = await get_or_create(
            db, Coach,
            filters={"email": data["email"]},
            defaults={
                "full_name": data["full_name"],
                "password": hash_password(data["password"])
            }
        )
        if created:
            print(f"  ✓ Coach created: {coach.email}")
        else:
            print(f"  - Coach already exists: {coach.email}")
        coaches.append(coach)
    return coaches

async def seed_boxers(db: AsyncSession, coaches: list):
    all_boxers = []
    for i, coach in enumerate(coaches):
        coach_boxers = []
        for data in BOXERS_PER_COACH[i]:
            boxer, created = await get_or_create(
                db, Boxer,
                filters={"email": data["email"]},
                defaults={
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "password": hash_password(data["password"]),
                    "coach_id": coach.id,
                    "picture": None
                }
            )
            if created:
                print(f"    ✓ Boxer created: {boxer.email} → coach: {coach.email}")
            else:
                print(f"    - Boxer already exists: {boxer.email}")
            coach_boxers.append(boxer)
        all_boxers.append(coach_boxers)
    return all_boxers

async def seed_schedules(db: AsyncSession, coaches: list):
    all_schedules = []
    for coach in coaches:
        coach_schedules = []
        for data in SCHEDULES_PER_COACH:
            schedule, created = await get_or_create(
                db, Schedule,
                filters={"name": data["name"], "coach_id": coach.id},
                defaults={"month": data["month"]}
            )
            if created:
                print(f"    ✓ Schedule created: {schedule.name} → coach: {coach.email}")
            else:
                print(f"    - Schedule already exists: {schedule.name}")
            coach_schedules.append(schedule)
        all_schedules.append(coach_schedules)
    return all_schedules

async def seed_sessions(db: AsyncSession, all_schedules: list):
    all_sessions = []
    for coach_schedules in all_schedules:
        coach_sessions = []
        for schedule in coach_schedules:
            schedule_sessions = []
            for data in SESSIONS_PER_SCHEDULE:
                session, created = await get_or_create(
                    db, Session,
                    filters={"name": data["name"], "schedule_id": schedule.id},
                    defaults={"session_date": data["session_date"]}
                )
                if created:
                    print(f"      ✓ Session created: {session.name} → schedule: {schedule.name}")
                else:
                    print(f"      - Session already exists: {session.name}")
                schedule_sessions.append(session)
            coach_sessions.append(schedule_sessions)
        all_sessions.append(coach_sessions)
    return all_sessions

async def seed_exercises(db: AsyncSession, all_sessions: list):
    for coach_sessions in all_sessions:
        for schedule_sessions in coach_sessions:
            for session in schedule_sessions:
                for data in EXERCISES_PER_SESSION:
                    exercise, created = await get_or_create(
                        db, Exercise,
                        filters={"name": data["name"], "session_id": session.id},
                        defaults={"description": data["description"]}
                    )
                    if created:
                        print(f"        ✓ Exercise created: {exercise.name} → session: {session.name}")
                    else:
                        print(f"        - Exercise already exists: {exercise.name}")

async def seed_attendance(db: AsyncSession, all_sessions: list, all_boxers: list):
    for coach_idx, coach_sessions in enumerate(all_sessions):
        boxers = all_boxers[coach_idx]
        for schedule_sessions in coach_sessions:
            for session in schedule_sessions:
                for boxer in boxers:
                    attendance, created = await get_or_create(
                        db, Attendance,
                        filters={"session_id": session.id, "boxer_id": boxer.id},
                        defaults={"attended_at": datetime.utcnow()}
                    )
                    if created:
                        print(f"        ✓ Attendance marked: {boxer.email} → session: {session.name}")
                    else:
                        print(f"        - Attendance already exists: {boxer.email} → session: {session.name}")

async def seed_reviews(db: AsyncSession, all_sessions: list, all_boxers: list):
    for coach_idx, coach_sessions in enumerate(all_sessions):
        boxers = all_boxers[coach_idx]
        for schedule_sessions in coach_sessions:
            for session in schedule_sessions:
                for boxer_idx, boxer in enumerate(boxers):
                    difficulty = DIFFICULTIES[boxer_idx % len(DIFFICULTIES)]
                    review, created = await get_or_create(
                        db, Review,
                        filters={"session_id": session.id, "boxer_id": boxer.id},
                        defaults={
                            "difficulty": difficulty,
                            "comment": f"Session felt {difficulty.value.replace('_', ' ')} for me."
                        }
                    )
                    if created:
                        print(f"        ✓ Review created: {boxer.email} → session: {session.name} ({difficulty.value})")
                    else:
                        print(f"        - Review already exists: {boxer.email} → session: {session.name}")

# ─── Main ────────────────────────────────────────────────────────────────────

async def main():
    print("\n🌱 Starting seed...\n")

    async with async_session() as db:
        async with db.begin():
            print("👤 Seeding admin...")
            await seed_admin(db)

            print("\n🥊 Seeding coaches...")
            coaches = await seed_coaches(db)

            print("\n🥊 Seeding boxers...")
            all_boxers = await seed_boxers(db, coaches)

            print("\n📅 Seeding schedules...")
            all_schedules = await seed_schedules(db, coaches)

            print("\n🗓️  Seeding sessions...")
            all_sessions = await seed_sessions(db, all_schedules)

            print("\n💪 Seeding exercises...")
            await seed_exercises(db, all_sessions)

            print("\n✅ Seeding attendance...")
            await seed_attendance(db, all_sessions, all_boxers)

            print("\n⭐ Seeding reviews...")
            await seed_reviews(db, all_sessions, all_boxers)

    print("\n✅ Seed completed successfully!\n")

if __name__ == "__main__":
    asyncio.run(main())