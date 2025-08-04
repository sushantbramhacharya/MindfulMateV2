from flask import Blueprint, jsonify, request
from app.config.db import DBConnection
from app.config.JWTConfig import JWTConfig
from datetime import datetime

chat_bp = Blueprint('chat', __name__)

def message_row_to_dict(row):
    return {
        "id": row["id"],
        "sender_id": row["sender_id"],
        "receiver_id": row["receiver_id"],
        "content": row["content"],
        "timestamp": row["timestamp"].isoformat() if row["timestamp"] else None,
    }

# GET chat count for current user
@chat_bp.route('/chat-count', methods=['GET'])
@JWTConfig.token_required
def get_chat_count(current_user):
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute(
                "SELECT chat_count FROM users WHERE id = %s",
                (current_user['user_id'],)
            )
            result = cursor.fetchone()
            if result is None:
                return jsonify({"message": "User not found"}), 404
            return jsonify({"chat_count": result['chat_count']}), 200
    except Exception as e:
        print(f"GET /chat-count error: {e}")
        return jsonify({"message": "Failed to retrieve chat count", "error": str(e)}), 500

# POST send message (requires chat_count > 0)
@chat_bp.route('/messages', methods=['POST'])
@JWTConfig.token_required
def send_message(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"message": "Missing JSON body"}), 400

    sender_id = current_user['user_id']
    content = data.get('content')

    if not content:
        return jsonify({"message": "content is required"}), 400

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            # Check chat count
            cursor.execute(
                "SELECT chat_count FROM users WHERE id = %s",
                (sender_id,)
            )
            user_row = cursor.fetchone()
            if user_row is None:
                return jsonify({"message": "User not found"}), 404
            if user_row['chat_count'] <= 0:
                return jsonify({"message": "You have no chats remaining"}), 403

            # Send message to expert (id = 8)
            cursor.execute("""
                INSERT INTO messages (sender_id, receiver_id, content, timestamp)
                VALUES (%s, %s, %s, %s)
                RETURNING id, sender_id, receiver_id, content, timestamp
            """, (sender_id, 8, content, datetime.utcnow()))
            message_row = cursor.fetchone()

            # Decrement chat count
            cursor.execute(
                "UPDATE users SET chat_count = chat_count - 1 WHERE id = %s",
                (sender_id,)
            )

            return jsonify({"message": "Message sent", "data": message_row_to_dict(message_row)}), 201

    except Exception as e:
        print(f"POST /messages error: {e}")
        return jsonify({"message": "Failed to send message", "error": str(e)}), 500

# GET messages between expert and specific user
@chat_bp.route('/messages/<user_id>', methods=['GET'])
@JWTConfig.token_required
def get_messages_with_user(current_user, user_id):
    # Only allow expert (ID = 8) to view other users’ chats
    if str(current_user['user_id']) != "8":
        return jsonify({"message": "Unauthorized"}), 403

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT id, sender_id, receiver_id, content, timestamp
                FROM messages
                WHERE (sender_id = %s AND receiver_id = 8)
                   OR (sender_id = 8 AND receiver_id = %s)
                ORDER BY timestamp ASC
            """, (user_id, user_id))
            rows = cursor.fetchall()
            messages = []
            for row in rows:
                message = message_row_to_dict(row)
                message['sender_type'] = 'expert' if row['sender_id'] == 8 else 'user'
                messages.append(message)
            return jsonify(messages), 200
    except Exception as e:
        print(f"GET /messages/<user_id> error: {e}")
        return jsonify({"message": "Failed to fetch messages", "error": str(e)}), 500
    
@chat_bp.route('/messages', methods=['GET'])
@JWTConfig.token_required
def get_my_messages(current_user):
    user_id = current_user['user_id']
    expert_id = 8

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT id, sender_id, receiver_id, content, timestamp
                FROM messages
                WHERE (sender_id = %s AND receiver_id = %s)
                   OR (sender_id = %s AND receiver_id = %s)
                ORDER BY timestamp ASC
            """, (user_id, expert_id, expert_id, user_id))
            rows = cursor.fetchall()

            messages = []
            for row in rows:
                message = message_row_to_dict(row)
                # Add sender_type field for frontend convenience
                message['sender_type'] = 'user' if row['sender_id'] == user_id else 'expert'
                messages.append(message)

            return jsonify(messages), 200
    except Exception as e:
        print(f"GET /messages error: {e}")
        return jsonify({"message": "Failed to fetch messages", "error": str(e)}), 500

@chat_bp.route('/expert/messages/<int:user_id>', methods=['POST'])
@JWTConfig.token_required
def expert_send_message(current_user, user_id):
    # Only allow expert to send messages via this route
    if str(current_user['user_id']) != "8":
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    if not data or not data.get('content'):
        return jsonify({"message": "Content is required"}), 400

    content = data['content']

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            # Insert message from expert (8) to user_id
            cursor.execute("""
                INSERT INTO messages (sender_id, receiver_id, content, timestamp)
                VALUES (%s, %s, %s, %s)
                RETURNING id, sender_id, receiver_id, content, timestamp
            """, (8, user_id, content, datetime.utcnow()))
            message_row = cursor.fetchone()

            return jsonify({
                "message": "Message sent",
                "data": message_row_to_dict(message_row)
            }), 201
    except Exception as e:
        print(f"POST /expert/messages/<user_id> error: {e}")
        return jsonify({"message": "Failed to send message", "error": str(e)}), 500

@chat_bp.route('/expert/users', methods=['GET'])
@JWTConfig.token_required
def get_accepted_users(current_user):
    # Only expert can access this
    if str(current_user['user_id']) != "8":
        return jsonify({"message": "Unauthorized"}), 403

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            # Get all distinct user IDs who have messages with expert
            cursor.execute("""
                SELECT DISTINCT 
                    CASE
                        WHEN sender_id = 8 THEN receiver_id
                        ELSE sender_id
                    END AS user_id
                FROM messages
                WHERE sender_id = 8 OR receiver_id = 8
            """)
            user_ids = [row['user_id'] for row in cursor.fetchall()]
            
            if not user_ids:
                return jsonify([]), 200
            
            # Get user details for these IDs
            format_strings = ",".join(["%s"] * len(user_ids))
            cursor.execute(f"""
                SELECT id AS user_id, name
                FROM users
                WHERE id IN ({format_strings})
                ORDER BY name
            """, tuple(user_ids))
            users = cursor.fetchall()

            return jsonify(users), 200
    except Exception as e:
        print(f"GET /expert/users error: {e}")
        return jsonify({"message": "Failed to fetch users", "error": str(e)}), 500