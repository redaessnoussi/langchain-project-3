from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage, AIMessage
from app.ai.tools import get_all_users, get_user_by_id, update_user, delete_user

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini")

tools = [get_all_users, get_user_by_id, update_user, delete_user]

agent = create_agent(
    llm,
    tools=tools,
    system_prompt=(
        "You are a helpful assistant that manages user records in a database. "
        "You can list all users, look up a specific user, update their information, and delete users. "
        "Before deleting a user, always confirm the action with the user. "
        "Be concise and friendly."
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