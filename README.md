# VeritasAI

VeritasAI is an AI-powered reflection and guidance platform that provides honest, practical, and constructive advice. 

The AI helps users identify blind spots, challenge weak reasoning, overcome procrastination, and make better decisions.

## Features

- **AI Chat**: 4 distinct modes (Truth, Mentor, Career, Productivity).
- **Chat History**: Save and resume conversations.
- **Save Insights**: Save important advice to your insights dashboard.
- **Daily Reality Check**: Get a fast, daily actionable quote.
- **Beautiful UI**: Modern, dark-mode, minimalist design using Tailwind CSS.

## Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Framer Motion, Lucide React
- **Backend**: Python, Flask, Flask-CORS
- **AI**: Groq API (LLaMA 3.1)
- **Database**: SQLite

## Setup Instructions

### 1. Backend Setup

Open a terminal and navigate to the root directory, then install the Python dependencies:

```bash
cd mindmirror-ai
pip install -r requirements.txt
```

Set your Groq API Key in `backend/.env`:
```
GROQ_API_KEY=your_api_key_here
```

Or set it in your environment:
- Windows: `set GROQ_API_KEY=your_api_key_here`
- macOS/Linux: `export GROQ_API_KEY=your_api_key_here`

Run the backend server:

```bash
cd backend
python app.py
```
The Flask backend will run at `http://127.0.0.1:5000`. It will automatically create the `database/mindmirror.db` file.

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory, then install the Node dependencies:

```bash
cd mindmirror-ai/frontend
npm install
```

Run the Vite development server:

```bash
npm run dev
```
(or `npm start` based on the package.json).
The frontend will run at `http://localhost:5173` (or the port Vite provides).

Enjoy reflecting and growing!
