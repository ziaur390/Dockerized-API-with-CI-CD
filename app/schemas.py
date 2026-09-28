from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    title: str = Field(min_length=1, max_length=200)
    completed: bool = False


class TaskUpdate(TaskCreate):
    """PUT replaces all editable fields."""


class TaskResponse(TaskCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
