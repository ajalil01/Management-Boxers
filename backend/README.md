# Management Boxers — Backend

## Part 1 — What Is This Backend?

This is the backend for the **Management Boxers** application, a platform designed to help boxing coaches manage their work digitally.

The system supports three types of users:

- **Admin** — manages coaches on the platform
- **Coach** — manages their own boxers, creates training schedules, sessions, and exercises, marks attendance, and views boxer reviews
- **Boxer** — views their attendance and leaves difficulty reviews on sessions they attended

The backend exposes a REST API built with **FastAPI**, following a **monolithic modular architecture** where each feature lives in its own self-contained module with its own model, schema, service, controller, and router.

---

## Part 2 — Tools & Technologies

| Tool | Purpose |
|---|---|
| **FastAPI** | Web framework for building the REST API |
| **SQLAlchemy** | ORM for database models and queries (async) |
| **Pydantic** | Data validation and serialization |
| **pydantic-settings** | Environment variable management |
| **python-jose** | JWT token encoding and decoding |
| **passlib + bcrypt** | Password hashing |
| **aiosqlite** | Async SQLite driver (current database) |
| **Alembic** | Database migrations |
| **uvicorn** | ASGI server to run the app |
| **python-multipart** | File upload handling (boxer profile pictures) |
| **colorama** | Colored console logging |
| **Docker** | Containerization for consistent environments |

---

## Part 3 — How To Run It

### Prerequisites

- Python 3.12+
- pip
- Docker (optional)

---

### Option A — Run Locally Without Docker

**1. Clone the repository**
```bash
git clone https://github.com/jalil-benzid/Management-Boxers.git
cd Management-Boxers/backend
```

**2. Create and activate a virtual environment**
```bash
python -m venv venv
source venv/bin/activate        # Linux / macOS
venv\Scripts\activate           # Windows
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Create your `.env` file**
```bash
cp .env.example .env
```

Then fill in the values in `.env`:
```
DATABASE_URL=sqlite+aiosqlite:///./management_boxers.db
DEBUG=False
SECRET_KEY=the-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
BASE_IMG_URL=http://localhost:8000
```

**5. Run database migrations**
```bash
alembic upgrade head
```

**6. Run the seed (optional but recommended)**
```bash
python -m src.seed
```

This will create:
- 1 Admin
- 3 Coaches (each with 4 Boxers)
- 2 Schedules per coach (each with 3 Sessions)
- 3 Exercises per session
- Attendance and reviews for all sessions

Default credentials after seeding:
```
Admin:   admin@boxers.com   / admin123
Coach:   carlos@boxers.com  / coach123
Boxer:   ali@boxers.com     / boxer123
```

**7. Start the server**
```bash
uvicorn src.main:app --reload
```

The API will be available at: `http://localhost:8000`  
Interactive docs at: `http://localhost:8000/docs`

---

### Option B — Run With Docker

**1. Make sure Docker is installed and running**

**2. Build and start the container**
```bash
cd backend
docker-compose up --build
```

The API will be available at: `http://localhost:8000`

---

## Part 4 — Database & Deployment Notes

### Current Setup

The application is currently using **SQLite** as the database, which is stored as a local file (`management_boxers.db`). This is perfectly fine for development and early production.

The app is deployed on **[Render](https://render.com)** as a Web Service.

### Switching To PostgreSQL (When Needed)

Thanks to **SQLAlchemy**, switching from SQLite to PostgreSQL requires **zero code changes**. The only thing that changes is the `DATABASE_URL` environment variable.

When you are ready to switch:

**1. Create a PostgreSQL database** (Render offers a managed PostgreSQL service)

**2. Update your `DATABASE_URL`** to the PostgreSQL connection string:
```
DATABASE_URL=postgresql+asyncpg://user:password@host:port/dbname
```

**3. Install the async PostgreSQL driver**
```bash
pip install asyncpg
```

**4. Run migrations against the new database**
```bash
alembic upgrade head
```

That's it — no model changes, no query changes, nothing else.

### Render Deployment

The app is configured to run on Render with the following settings:

- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

All environment variables are configured directly in the Render dashboard.
