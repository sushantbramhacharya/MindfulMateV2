from flask import Blueprint, request, jsonify
from app.config.db import DBConnection

comments_bp = Blueprint('comments', __name__)

def row_to_dict(row):
    if not row:
        return None
    data = dict(row)
    # Format timestamp if present
    if 'timestamp' in data and data['timestamp']:
        # Use isoformat if datetime object, else keep as is
        if hasattr(data['timestamp'], 'isoformat'):
            data['timestamp'] = data['timestamp'].isoformat()
        elif hasattr(data['timestamp'], 'strftime'):
            data['timestamp'] = data['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
    return data

@comments_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute(
                "SELECT id, post_id, author, text, timestamp FROM comments WHERE post_id = %s ORDER BY timestamp ASC",
                (post_id,)
            )
            comments = cursor.fetchall()
            comments_list = [row_to_dict(row) for row in comments]
            return jsonify({"data": comments_list, "message": "Comments retrieved successfully"}), 200
    except Exception as e:
        print(f"GET /api/posts/{post_id}/comments error: {e}")
        return jsonify({"message": "Failed to retrieve comments", "error": str(e)}), 500

@comments_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
def add_comment(post_id):
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid JSON data"}), 400
    
    author = data.get('author')
    text = data.get('text')
    print(author, text)
    if not author or not text:
        return jsonify({"message": "Missing required fields: author and text"}), 400

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                INSERT INTO comments (post_id, author, text, timestamp)
                VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                RETURNING id, post_id, author, text, timestamp
                """,
                (post_id, author, text)
            )
            new_comment = cursor.fetchone()
            return jsonify({"message": "Comment added successfully", "data": row_to_dict(new_comment)}), 201
    except Exception as e:
        print(f"POST /api/posts/{post_id}/comments error: {e}")
        return jsonify({"message": "Failed to add comment", "error": str(e)}), 500

@comments_bp.route('/comments/<int:comment_id>', methods=['PUT'])
def update_comment(comment_id):
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid JSON data"}), 400

    text = data.get('text')
    if not text:
        return jsonify({"message": "No text provided for update"}), 400

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                UPDATE comments
                SET text = %s, timestamp = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, post_id, author, text, timestamp
                """,
                (text, comment_id)
            )
            updated_comment = cursor.fetchone()
            if updated_comment:
                return jsonify({"message": "Comment updated successfully", "data": row_to_dict(updated_comment)}), 200
            return jsonify({"message": "Comment not found"}), 404
    except Exception as e:
        print(f"PUT /api/comments/{comment_id} error: {e}")
        return jsonify({"message": "Failed to update comment", "error": str(e)}), 500

@comments_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("DELETE FROM comments WHERE id = %s RETURNING id", (comment_id,))
            deleted = cursor.fetchone()
            if deleted:
                return jsonify({"message": "Comment deleted successfully", "data": {"id": deleted['id']}}), 200
            return jsonify({"message": "Comment not found"}), 404
    except Exception as e:
        print(f"DELETE /api/comments/{comment_id} error: {e}")
        return jsonify({"message": "Failed to delete comment", "error": str(e)}), 500
