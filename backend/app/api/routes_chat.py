from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.ai.agent import run_agent

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    reply: str


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    try:
        reply = await run_agent(messages)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return ChatResponse(reply=reply)