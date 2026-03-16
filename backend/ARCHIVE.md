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

logger.info("Admin created successfully")
logger.warning("Duplicate admin email attempted")
logger.error("Failed to create admin")
pip install email-validator