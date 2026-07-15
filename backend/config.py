from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str
    supabase_url: str = ""
    supabase_key: str = ""
    github_token: str = ""
    cors_origins_str: str = "http://localhost:3000,https://foundrybuild.xyz"
    gemini_model: str = "gemini-2.5-flash"
    max_interview_turns: int = 8

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins_str.split(",") if o.strip()]


settings = Settings()
