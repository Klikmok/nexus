from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db
from app.routers import auth, profile, ideas, financial, validation, roadmap
from app.config import settings
import asyncio
import structlog

log = structlog.get_logger()

DB_INIT_TIMEOUT = 30  # seconds


async def _init_db_background() -> None:
    """Run init_db() with a timeout in a background task.

    Errors are logged but never propagate — the app must stay alive even
    when the database is temporarily unreachable at boot time.
    """
    try:
        await asyncio.wait_for(init_db(), timeout=DB_INIT_TIMEOUT)
        log.info("Database initialised successfully")
    except asyncio.TimeoutError:
        log.error(
            "Database initialisation timed out",
            timeout_seconds=DB_INIT_TIMEOUT,
        )
    except Exception as exc:
        log.error("Database initialisation failed", error=str(exc))


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Starting Nexus API", version="0.4.0")
    # Fire-and-forget: schedule DB init as a background task so the app
    # becomes ready to serve requests (health checks, etc.) immediately.
    asyncio.create_task(_init_db_background())
    yield

app = FastAPI(title="Nexus API", version="0.4.0", lifespan=lifespan)

# CORS — разрешаем Vercel домен и localhost для разработки
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://*.vercel.app",
]
# Если задан явный FRONTEND_URL — добавляем
if settings.FRONTEND_URL:
    origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",   # все preview-деплои
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(ideas.router)
app.include_router(financial.router)
app.include_router(validation.router)
app.include_router(roadmap.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "0.4.0"}
