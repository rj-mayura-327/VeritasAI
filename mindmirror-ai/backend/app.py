from flask import Flask, request, jsonify
from flask_cors import CORS
from database.db import init_db, get_db
from services.groq_ai import generate_response, generate_daily_check

app = Flask(__name__)
CORS(app)

# Initialize DB on startup
with app.app_context():
    init_db()

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message')
    mode = data.get('mode', 'Mentor')
    conversation_id = data.get('conversation_id')
    
    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400
        
    conn = get_db()
    c = conn.cursor()
    
    # Create conversation if it doesn't exist
    if not conversation_id:
        c.execute('INSERT INTO conversations (title) VALUES (?)', (message[:50] + '...' if len(message) > 50 else message,))
        conversation_id = c.lastrowid
        
    # Save user message
    c.execute('INSERT INTO messages (conversation_id, role, content, mode) VALUES (?, ?, ?, ?)',
              (conversation_id, 'user', message, mode))
              
    # Get conversation history
    c.execute('SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id ASC', (conversation_id,))
    history = [{'role': row['role'], 'content': row['content']} for row in c.fetchall()]
    
    # Generate AI response
    ai_response = generate_response(history, mode)
    
    # Save AI response
    c.execute('INSERT INTO messages (conversation_id, role, content, mode) VALUES (?, ?, ?, ?)',
              (conversation_id, 'ai', ai_response, mode))
              
    conn.commit()
    conn.close()
    
    return jsonify({
        "conversation_id": conversation_id,
        "response": ai_response
    })

@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT id, title, created_at FROM conversations ORDER BY created_at DESC')
    conversations = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(conversations)

@app.route('/api/conversations/<int:id>', methods=['GET'])
def get_conversation(id):
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM messages WHERE conversation_id = ? ORDER BY id ASC', (id,))
    messages = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(messages)

@app.route('/api/conversations/<int:id>', methods=['DELETE'])
def delete_conversation(id):
    conn = get_db()
    c = conn.cursor()
    c.execute('DELETE FROM messages WHERE conversation_id = ?', (id,))
    c.execute('DELETE FROM conversations WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/insights', methods=['POST'])
def save_insight():
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

@app.route('/api/insights', methods=['GET'])
def get_insights():
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM insights ORDER BY created_at DESC')
    insights = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(insights)

@app.route('/api/insights/<int:id>', methods=['DELETE'])
def delete_insight(id):
    conn = get_db()
    c = conn.cursor()
    c.execute('DELETE FROM insights WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/daily-check', methods=['GET'])
def daily_check():
    msg = generate_daily_check()
    return jsonify({"message": msg})

if __name__ == '__main__':
    app.run(debug=True, port=5000, use_reloader=False)
