python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn[standard]
pip install sqlalchemy aiosqlite
pip freeze > requirements.txt
uvicorn src.main:app --reload
http://127.0.0.1:8000/docs
pip install fastapi uvicorn
pip freeze > requirements.txt
pip install python-dotenv
pip install python-jose[cryptography] python-multipart
pip install python-multipart

logger.info("Admin created successfully")
logger.warning("Duplicate admin email attempted")
logger.error("Failed to create admin")
pip install email-validator

docker build -t boxers-api .
docker-compose up

pip install fastapi-limiter redis


may improve architecture:
https://claude.ai/share/f4bccdc2-5934-4de9-9757-ce21e0695e4e


maybe later
You'll need to create and run a migration to add the new columns:

bash
alembic revision --autogenerate -m "Add start_time and end_time to sessions"
alembic upgrade head
