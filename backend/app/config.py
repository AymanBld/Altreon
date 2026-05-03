"""
ALTREON — Application Configuration
Loads settings from .env — NVIDIA NIM API (OpenAI-compatible).
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Provider Selection ───────────────────────────────────────
    active_ai_provider: str = "nvidia"  # 'google', 'nvidia', or 'groq'

    # ── Google AI Studio (Gemini) ────────────────────────────────
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3-flash-preview"

    # ── NVIDIA NIM API (OpenAI-compatible) ───────────────────────
    nvidia_api_key: str = ""
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_model: str = "google/gemma-4-31b-it"

    # ── Groq API (OpenAI-compatible) ─────────────────────────────
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # ── Server ───────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8000

    # ── Database ─────────────────────────────────────────────────
    database_url: str = "sqlite+aiosqlite:///./altreon.db"

    # ── n8n ──────────────────────────────────────────────────────
    n8n_webhook_url: str = ""

    # ── Security ─────────────────────────────────────────────────
    secret_key: str = "dev-secret-change-me"
    
    # ── Firebase / FCM ───────────────────────────────────────────
    firebase_credentials_path: str = ""  # Path to Firebase service account JSON
    fcm_enabled: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
