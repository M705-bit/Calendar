from pydantic import BaseModel, Field
from datetime import date

class friendCreate(BaseModel):
    name: str = Field(..., description="Nome do amigo")
    birthday: date = Field(..., description="Data de aniversário do amigo")