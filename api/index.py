import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import requests as http_requests

app = Flask(__name__)
CORS(app)

# ─── Database Setup (use /tmp on Vercel) ───────────────────────────────────────
DB_PATH = os.path.join('/tmp', 'veritasai.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            mode TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(conversation_id) REFERENCES conversations(id)
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS insights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# Initialize DB
init_db()

# ─── Groq AI Service ───────────────────────────────────────────────────────────
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.1-8b-instant"

MODES = {
    "Truth": "You give direct, honest answers without sugarcoating.",
    "Mentor": "You provide supportive guidance with empathy.",
    "Career": "You give practical professional advice.",
    "Productivity": "You focus on actionable habits and time management."
}

def _get_api_key():
    api_key = os.getenv("GROQ_API_KEY", "").strip().strip('"').strip("'")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    return api_key

def _call_groq(messages, temperature=0.7, max_tokens=200):
    api_key = _get_api_key()
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    response = http_requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]

def generate_response(messages, mode="Mentor"):
    try:
        _get_api_key()
    except ValueError as e:
        return f"Error: {str(e)}"

    system_prompt = MODES.get(mode, MODES["Mentor"])
    system_prompt += """\n\nCore Rules:
- Answer the question immediately in the first sentence
- Keep responses between 2-6 sentences unless detailed explanation is requested
- Use a single natural paragraph by default
- Only use lists or bullets when they genuinely improve clarity
- NEVER start with: "That's an interesting question", "You're asking about", "What a thoughtful question", or any conversational filler
- Do NOT assume user's intentions, emotions, or motivations
- Do NOT add follow-up questions unless necessary
- Avoid repetition, generic advice, and philosophical tangents
- Explain only what is required to answer the question
- Sound natural and human, not like a textbook or motivational speaker
- Do NOT use markdown formatting (no *, **, #, -, bullets unless absolutely necessary for clarity)
- If the question can be answered in one paragraph, provide one paragraph and stop

Structure: Direct answer. Brief explanation if needed. Stop."""

    try:
        groq_messages = [{"role": "system", "content": system_prompt}]
        for msg in messages:
            role = "assistant" if msg['role'] == 'ai' else "user"
            groq_messages.append({"role": role, "content": msg['content']})
        return _call_groq(groq_messages)
    except Exception as e:
        return f"Error communicating with Groq: {str(e)}"

def generate_daily_check():
    try:
        _get_api_key()
        messages = [
            {"role": "system", "content": "You give short, punchy daily reality checks about productivity and learning."},
            {"role": "user", "content": "Give me a one sentence 'daily reality check' about productivity or learning. Make it direct, slightly tough love, and actionable."}
        ]
        return _call_groq(messages, temperature=0.9, max_tokens=100).strip()
    except Exception:
        return "You don't need another course today. You need to finish what you already started."

# ─── API Routes ─────────────────────────────────────────────────────────────────
@app.route('/chat', methods=['POST'])
@app.route('/api/chat', methods=['POST'])
def chat():
    init_db()
    data = request.json
    message = data.get('message')
    mode = data.get('mode', 'Mentor')
    conversation_id = data.get('conversation_id')

    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400

    conn = get_db()
    c = conn.cursor()

    if not conversation_id:
        c.execute('INSERT INTO conversations (title) VALUES (?)', (message[:50] + '...' if len(message) > 50 else message,))
        conversation_id = c.lastrowid

    c.execute('INSERT INTO messages (conversation_id, role, content, mode) VALUES (?, ?, ?, ?)',
              (conversation_id, 'user', message, mode))

    c.execute('SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id ASC', (conversation_id,))
    history = [{'role': row['role'], 'content': row['content']} for row in c.fetchall()]

    ai_response = generate_response(history, mode)

    c.execute('INSERT INTO messages (conversation_id, role, content, mode) VALUES (?, ?, ?, ?)',
              (conversation_id, 'ai', ai_response, mode))

    conn.commit()
    conn.close()

    return jsonify({
        "conversation_id": conversation_id,
        "response": ai_response
    })

@app.route('/conversations', methods=['GET'])
@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    init_db()
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT id, title, created_at FROM conversations ORDER BY created_at DESC')
    conversations = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(conversations)

@app.route('/conversations/<int:id>', methods=['GET'])
@app.route('/api/conversations/<int:id>', methods=['GET'])
def get_conversation(id):
    init_db()
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM messages WHERE conversation_id = ? ORDER BY id ASC', (id,))
    messages = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(messages)

@app.route('/conversations/<int:id>', methods=['DELETE'])
@app.route('/api/conversations/<int:id>', methods=['DELETE'])
def delete_conversation(id):
    init_db()
    conn = get_db()
    c = conn.cursor()
    c.execute('DELETE FROM messages WHERE conversation_id = ?', (id,))
    c.execute('DELETE FROM conversations WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/insights', methods=['POST'])
@app.route('/api/insights', methods=['POST'])
def save_insight():
    init_db()
    data = request.json
    content = data.get('content')
    if not content:
        return jsonify({"error": "Content cannot be empty"}), 400

    conn = get_db()
    c = conn.cursor()
    c.execute('INSERT INTO insights (content) VALUES (?)', (content,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/insights', methods=['GET'])
@app.route('/api/insights', methods=['GET'])
def get_insights():
    init_db()
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM insights ORDER BY created_at DESC')
    insights = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(insights)

@app.route('/insights/<int:id>', methods=['DELETE'])
@app.route('/api/insights/<int:id>', methods=['DELETE'])
def delete_insight(id):
    init_db()
    conn = get_db()
    c = conn.cursor()
    c.execute('DELETE FROM insights WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/daily-check', methods=['GET'])
@app.route('/api/daily-check', methods=['GET'])
def daily_check():
    msg = generate_daily_check()
    return jsonify({"message": msg})

# Health check
@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})
