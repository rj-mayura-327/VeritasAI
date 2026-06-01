import os
from pathlib import Path
import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

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
    """Make a direct HTTP request to the Groq API."""
    api_key = _get_api_key()
    if not api_key:
        raise ValueError("Groq API key is not configured.")

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
    response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]

def generate_response(messages, mode="Mentor"):
    try:
        api_key = _get_api_key()
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
        api_key = _get_api_key()
        messages = [
            {"role": "system", "content": "You give short, punchy daily reality checks about productivity and learning."},
            {"role": "user", "content": "Give me a one sentence 'daily reality check' about productivity or learning. Make it direct, slightly tough love, and actionable."}
        ]
        return _call_groq(messages, temperature=0.9, max_tokens=100).strip()
    except Exception:
        return "You don't need another course today. You need to finish what you already started."
