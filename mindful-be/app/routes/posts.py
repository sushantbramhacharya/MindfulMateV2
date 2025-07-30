from flask import Blueprint, request, jsonify, abort
from datetime import datetime
from app.config.db import DBConnection
from app.config.JWTConfig import JWTConfig  # for @token_required decorator

posts_bp = Blueprint('posts', __name__)

def row_to_dict(row):
    if not row:
        return None
    return dict(row)

@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT 
                    p.*, 
                    u.name AS author_name,
                    (SELECT COUNT(*) FROM post_upvotes u2 WHERE u2.post_id = p.id) AS upvotes_count
                FROM posts p
                JOIN users u ON p.author_id = u.id
                ORDER BY p.timestamp DESC
            """)
            posts = cursor.fetchall()
            return jsonify({"data": posts, "message": "Posts retrieved successfully"}), 200
    except Exception as e:
        print(f"GET /api/posts error: {e}")
        return jsonify({"message": "Failed to retrieve posts", "error": str(e)}), 500


@posts_bp.route('/posts', methods=['POST'])
@JWTConfig.token_required
def create_post(current_user):
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    category = data.get('category')
    author_id = current_user['user_id']  # use 'id' or 'user_id' depending on your JWT payload

    if not all([title, content, category]):
        return jsonify({"message": "Missing required fields"}), 400

    timestamp = datetime.utcnow()

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("""
                INSERT INTO posts (title, content, category, author_id, timestamp)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING *
            """, (title, content, category, author_id, timestamp))
            new_post = cursor.fetchone()
            return jsonify({"message": "Post created successfully", "data": new_post}), 201
    except Exception as e:
        print(f"POST /api/posts error: {e}")
        return jsonify({"message": "Failed to create post", "error": str(e)}), 500

@posts_bp.route('/posts/<int:post_id>', methods=['PUT'])
@JWTConfig.token_required
def update_post(post_id):
    data = request.get_json()
    set_clauses = []
    values = []

    for field in ['title', 'content', 'category']:
        if field in data:
            set_clauses.append(f"{field} = %s")
            values.append(data[field])

    if not set_clauses:
        return jsonify({"message": "No fields provided for update"}), 400

    set_clauses.append("timestamp = CURRENT_TIMESTAMP")
    values.append(post_id)

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            query = f"UPDATE posts SET {', '.join(set_clauses)} WHERE id = %s RETURNING *"
            cursor.execute(query, tuple(values))
            updated_post = cursor.fetchone()
            if updated_post:
                return jsonify({"message": "Post updated successfully", "data": updated_post}), 200
            return jsonify({"message": "Post not found"}), 404
    except Exception as e:
        print(f"PUT /api/posts/{post_id} error: {e}")
        return jsonify({"message": "Failed to update post", "error": str(e)}), 500

@posts_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@JWTConfig.token_required
def delete_post(post_id):
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("DELETE FROM posts WHERE id = %s RETURNING id", (post_id,))
            deleted = cursor.fetchone()
            if deleted:
                return jsonify({"message": "Post deleted successfully", "data": {"id": deleted['id']}}), 200
            return jsonify({"message": "Post not found"}), 404
    except Exception as e:
        print(f"DELETE /api/posts/{post_id} error: {e}")
        return jsonify({"message": "Failed to delete post", "error": str(e)}), 500

@posts_bp.route('/posts/<int:post_id>/upvote', methods=['POST'])
@JWTConfig.token_required
def upvote_post(current_user, post_id):
    user_id = current_user['user_id']

    try:
        with DBConnection.get_cursor() as cursor:
            # Check if user already upvoted
            cursor.execute("SELECT 1 FROM post_upvotes WHERE post_id = %s AND user_id = %s", (post_id, user_id))
            already_upvoted = cursor.fetchone()

            if already_upvoted:
                # Remove the upvote
                cursor.execute("DELETE FROM post_upvotes WHERE post_id = %s AND user_id = %s", (post_id, user_id))
                cursor.execute("UPDATE posts SET upvotes_count = upvotes_count - 1 WHERE id = %s", (post_id,))
                return jsonify({"message": "Upvote removed"}), 200
            else:
                # Add the upvote
                cursor.execute(
                    "INSERT INTO post_upvotes (post_id, user_id, timestamp) VALUES (%s, %s, CURRENT_TIMESTAMP)",
                    (post_id, user_id)
                )
                cursor.execute("UPDATE posts SET upvotes_count = upvotes_count + 1 WHERE id = %s", (post_id,))
                return jsonify({"message": "Post upvoted successfully"}), 200

    except Exception as e:
        print(f"POST /api/posts/{post_id}/upvote error: {e}")
        return jsonify({"message": "Failed to toggle upvote", "error": str(e)}), 500
