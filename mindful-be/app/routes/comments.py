from flask import Blueprint, request, jsonify
from app.config.db import DBConnection
from app.config.JWTConfig import JWTConfig  # <-- import token_required

comments_bp = Blueprint('comments', __name__)

def row_to_dict(row):
    if not row:
        return None
    data = dict(row)
    if 'timestamp' in data and data['timestamp']:
        if hasattr(data['timestamp'], 'isoformat'):
            data['timestamp'] = data['timestamp'].isoformat()
        elif hasattr(data['timestamp'], 'strftime'):
            data['timestamp'] = data['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
    return data

# ─────────────────────────────────────
# GET comments for a post
# ─────────────────────────────────────
@comments_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                SELECT c.id, c.post_id, c.author_id, u.name AS author_name, c.text, c.timestamp
                FROM comments c
                JOIN users u ON c.author_id = u.id
                WHERE c.post_id = %s
                ORDER BY c.timestamp ASC
                """,
                (post_id,)
            )
            comments = cursor.fetchall()
            comments_list = [row_to_dict(row) for row in comments]
            return jsonify({"data": comments_list, "message": "Comments retrieved successfully"}), 200
    except Exception as e:
        print(f"GET /api/posts/{post_id}/comments error: {e}")
        return jsonify({"message": "Failed to retrieve comments", "error": str(e)}), 500

# ─────────────────────────────────────
# POST comment (with user_id from token)
# ─────────────────────────────────────
@comments_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@JWTConfig.token_required
def add_comment(current_user, post_id):
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid JSON data"}), 400
    
    text = data.get('text')
    if not text:
        return jsonify({"message": "Missing required field: text"}), 400

    author_id = current_user['user_id']  # ← from JWT

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                INSERT INTO comments (post_id, author_id, text, timestamp)
                VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                RETURNING id, post_id, author_id, text, timestamp
                """,
                (post_id, author_id, text)
            )
            new_comment = cursor.fetchone()

            # Get author name for response
            cursor.execute("SELECT name FROM users WHERE id = %s", (author_id,))
            author_name = cursor.fetchone()['name']
            result = row_to_dict(new_comment)
            result['author_name'] = author_name

            return jsonify({"message": "Comment added successfully", "data": result}), 201
    except Exception as e:
        print(f"POST /api/posts/{post_id}/comments error: {e}")
        return jsonify({"message": "Failed to add comment", "error": str(e)}), 500


@comments_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@JWTConfig.token_required
def delete_comment(current_user, comment_id):
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            # Check if the comment exists
            cursor.execute("SELECT * FROM comments WHERE id = %s", (comment_id,))
            comment = cursor.fetchone()
            print("Comment object:", comment)
            if not comment:
                return jsonify({"message": "Comment not found"}), 404

            # Check if the current user is the author
            if comment['author_id'] != current_user['user_id']:
                return jsonify({"message": "Unauthorized"}), 403

            # Delete the comment without RETURNING clause
            cursor.execute("DELETE FROM comments WHERE id = %s", (comment_id,))

            if cursor.rowcount > 0:
                return jsonify({"message": "Comment deleted successfully", "data": {"id": comment_id}}), 200
            else:
                return jsonify({"message": "Failed to delete comment"}), 500
    except Exception as e:
        print(f"DELETE /api/comments/{comment_id} error: {e}")
        return jsonify({"message": "Internal server error", "error": str(e)}), 500
