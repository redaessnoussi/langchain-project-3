from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage, AIMessage
from app.ai.tools import get_all_users, get_user_by_id, update_user, delete_user, search_knowledge_base

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

tools = [get_all_users, get_user_by_id, update_user, delete_user, search_knowledge_base]

agent = create_agent(
    llm,
    tools=tools,
    system_prompt=(
        "You are an IT helpdesk AI assistant. You have two areas of expertise:\n"
        "1. IT Support: When a user describes a technical problem, ALWAYS use the "
        "search_knowledge_base tool first to find similar resolved tickets and their solutions. "
        "Base your answer on the retrieved results.\n"
        "2. User Management: You can list all users, look up a specific user, update their "
        "information, and delete users. Before deleting, always confirm with the user.\n"
        "Be concise, friendly, and solution-focused."
    )
)


async def run_agent(messages: list[dict]) -> str:
    chat_history = []
    for msg in messages:
        if msg["role"] == "user":
            chat_history.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            chat_history.append(AIMessage(content=msg["content"]))

    result = await agent.ainvoke({"messages": chat_history})
    return result["messages"][-1].content