from flask import Blueprint, jsonify
from app.config.db import DBConnection
from app.config.JWTConfig import JWTConfig

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat-count', methods=['GET'])
@JWTConfig.token_required
def get_chat_count(current_user):
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                SELECT chat_count FROM users WHERE id = %s
                """,
                (current_user['user_id'],)
            )
            result = cursor.fetchone()
            if result is None:
                return jsonify({"message": "User not found"}), 404
            return jsonify({"chat_count": result['chat_count']}), 200
    except Exception as e:
        print(f"GET /chat-count error: {e}")
        return jsonify({"message": "Failed to retrieve chat count", "error": str(e)}), 500
