from flask import Blueprint, request, jsonify
from app.config.db import DBConnection
from datetime import datetime

chat_requests_bp = Blueprint('chat_requests', __name__)

def row_to_dict(row):
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "user_name": row.get("user_name"),  # optional join on user table for name if implemented
        "session_duration": row["session_duration"],
        "requested_at": row["requested_at"].isoformat() if row["requested_at"] else None,
        "status": row["status"],
        "paid": row["paid"],
        "updated_at": row["updated_at"].isoformat() if row["updated_at"] else None,
    }

# POST /chat-requests - user creates a new chat session request
@chat_requests_bp.route('/chat-requests', methods=['POST'])
def create_chat_request():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Missing JSON body"}), 400

    session_duration = data.get("session_duration")
    user_id = data.get("user_id")  # now expecting user_id passed in request body
    if not session_duration or not user_id:
        return jsonify({"message": "Session duration and user_id are required"}), 400

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                INSERT INTO chat_session_requests (user_id, session_duration, status, paid, requested_at)
                VALUES (%s, %s, 'pending', FALSE, NOW())
                RETURNING id, user_id, session_duration, requested_at, status, paid, updated_at
                """,
                (user_id, session_duration)
            )
            row = cursor.fetchone()
            return jsonify({"message": "Request created", "data": row_to_dict(row)}), 201
    except Exception as e:
        print(f"POST /chat-requests error: {e}")
        return jsonify({"message": "Failed to create chat request", "error": str(e)}), 500

# GET /chat-requests - expert fetches all requests (no auth check)
@chat_requests_bp.route('/chat-requests', methods=['GET'])
def list_chat_requests():
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                SELECT r.id, r.user_id, u.name as user_name, r.session_duration, r.requested_at, r.status, r.paid, r.updated_at
                FROM chat_session_requests r
                LEFT JOIN users u ON u.id = r.user_id
                ORDER BY r.requested_at DESC
                """
            )
            rows = cursor.fetchall()
            results = [row_to_dict(row) for row in rows]
            return jsonify(results), 200
    except Exception as e:
        print(f"GET /chat-requests error: {e}")
        return jsonify({"message": "Failed to fetch chat requests", "error": str(e)}), 500

# PATCH /chat-requests/<id> - expert accepts/rejects and optionally marks as paid (no auth check)
@chat_requests_bp.route('/chat-requests/<int:request_id>', methods=['PATCH'])
def update_chat_request(request_id):
    data = request.get_json()
    if not data:
        return jsonify({"message": "Missing JSON body"}), 400

    status = data.get("status")  # expected: 'accepted' or 'rejected'
    paid = data.get("paid")      # boolean, optional

    if status not in ('accepted', 'rejected'):
        return jsonify({"message": "Invalid status"}), 400

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            # Update status and paid if provided
            if paid is not None:
                cursor.execute(
                    """
                    UPDATE chat_session_requests
                    SET status = %s, paid = %s, updated_at = NOW()
                    WHERE id = %s
                    RETURNING id, user_id, session_duration, requested_at, status, paid, updated_at
                    """,
                    (status, paid, request_id)
                )
            else:
                cursor.execute(
                    """
                    UPDATE chat_session_requests
                    SET status = %s, updated_at = NOW()
                    WHERE id = %s
                    RETURNING id, user_id, session_duration, requested_at, status, paid, updated_at
                    """,
                    (status, request_id)
                )
            row = cursor.fetchone()
            if not row:
                return jsonify({"message": "Request not found"}), 404

            return jsonify({"message": "Request updated", "data": row_to_dict(row)}), 200
    except Exception as e:
        print(f"PATCH /chat-requests/{request_id} error: {e}")
        return jsonify({"message": "Failed to update chat request", "error": str(e)}), 500
