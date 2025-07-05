from flask import Blueprint, request, jsonify
from app.config.db import DBConnection
from app.config.JWTConfig import JWTConfig

moods_bp = Blueprint('moods', __name__)

def row_to_dict(row):
    return {
        "id": row["id"],
        "mood": row["mood"],
        "notes": row["notes"],
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }

@moods_bp.route('/moods', methods=['POST'])
@JWTConfig.token_required
def log_mood(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"message": "Missing JSON body"}), 400

    mood = data.get('mood')
    notes = data.get('notes', '')

    if not mood:
        return jsonify({"message": "Mood is required"}), 400

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                INSERT INTO moods (user_id, mood, notes)
                VALUES (%s, %s, %s)
                RETURNING id, mood, notes, created_at
                """,
                (current_user['user_id'], mood, notes)
            )
            mood_row = cursor.fetchone()
            return jsonify({"message": "Mood logged", "data": row_to_dict(mood_row)}), 201
    except Exception as e:
        print(f"POST /api/moods error: {e}")
        return jsonify({"message": "Failed to log mood", "error": str(e)}), 500

@moods_bp.route('/moods', methods=['GET'])
@JWTConfig.token_required
def get_moods(current_user):
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                SELECT id, mood, notes, created_at
                FROM moods
                WHERE user_id = %s
                ORDER BY created_at DESC
                """,
                (current_user['user_id'],)
            )
            rows = cursor.fetchall()
            moods = [row_to_dict(row) for row in rows]
            return jsonify(moods), 200
    except Exception as e:
        print(f"GET /api/moods error: {e}")
        return jsonify({"message": "Failed to fetch mood history", "error": str(e)}), 500
