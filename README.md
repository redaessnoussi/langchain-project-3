# LangChain User Management Dashboard

A full-stack web application that combines a user management dashboard with an AI-powered chat interface. The AI agent — built with LangChain and GPT-4o-mini — can query, update, and delete users directly in the database through natural language conversation.

## Features

- **User Dashboard** — view all users in a sortable table with inline delete support
- **AI Chat Agent** — conversational interface backed by a LangChain agent with database tools
  - List all users
  - Look up a user by ID
  - Update user fields (name, email, phone, address)
  - Delete a user (with confirmation prompt)
- **REST API** — FastAPI backend with full CRUD endpoints for users

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend  | FastAPI, Uvicorn, SQLModel (SQLite)             |
| AI       | LangChain, `langchain-openai` (GPT-4o-mini)    |

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── agent.py      # LangChain agent setup
│   │   │   └── tools.py      # LangChain tools (CRUD on User table)
│   │   ├── api/
│   │   │   ├── routes_chat.py   # POST /chat/
│   │   │   └── routes_users.py  # GET/PUT/DELETE /users/
│   │   ├── db/
│   │   │   ├── database.py   # SQLite engine & table creation
│   │   │   └── models.py     # User SQLModel
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic layer
│   │   └── main.py           # FastAPI app entry point
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChatPanel.tsx  # AI chat UI
    │   │   └── UserTable.tsx  # User list table
    │   ├── pages/
    │   │   └── Dashboard.tsx  # Main dashboard page
    │   └── services/
    │       └── api.ts         # API client functions
    ├── index.html
    └── package.json
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file with your OpenAI key
echo "OPENAI_API_KEY=sk-..." > .env

# Start the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## API Endpoints

| Method | Path             | Description              |
| ------ | ---------------- | ------------------------ |
| GET    | `/users/`        | List all users           |
| GET    | `/users/{id}`    | Get a user by ID         |
| PUT    | `/users/{id}`    | Update a user            |
| DELETE | `/users/{id}`    | Delete a user            |
| POST   | `/chat/`         | Send a message to the AI agent |

### Chat Request Example

```json
POST /chat/
{
  "messages": [
    { "role": "user", "content": "List all users" }
  ]
}
```

```json
{
  "reply": "Here are the current users:\nID: 1 | Name: Reda | Email: reda@test.com | ..."
}
```

## Environment Variables

| Variable         | Description                  |
| ---------------- | ---------------------------- |
| `OPENAI_API_KEY` | Your OpenAI API key (required) |

Create a `backend/.env` file and add the variable there. `python-dotenv` loads it automatically on startup.

## Development Scripts (Frontend)

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `npm run dev`      | Start Vite dev server          |
| `npm run build`    | Type-check and build for prod  |
| `npm run lint`     | Run ESLint                     |
| `npm run format`   | Format code with Prettier      |
| `npm run typecheck`| Run TypeScript type checking   |
