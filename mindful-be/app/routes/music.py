# myapp/music.py
from flask import Blueprint, request, jsonify, send_from_directory, abort, current_app
from datetime import datetime
import uuid
import os
from werkzeug.utils import secure_filename
from app.config.db import DBConnection

UPLOAD_FOLDER = os.path.normpath('uploads/music')

music_bp = Blueprint('music', __name__)

def row_to_dict(row):
    if not row:
        return None
    data = dict(row)
    if 'tags' in data and data['tags'] is None:
        data['tags'] = []
    if 'id' in data:
        data['file_url'] = f'http://localhost:5000/api/music/serve/{data["id"]}'
    if 'file_path' in data:
        data['filename'] = os.path.basename(data['file_path'])
    return data

@music_bp.route('/music', methods=['GET'])
def get_music():
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("SELECT id, music_name, author, category, file_path, tags, created_at, updated_at FROM music ORDER BY created_at DESC")
            music_records = cursor.fetchall()
            music_list = [row_to_dict(record) for record in music_records]
            return jsonify({"data": music_list, "message": "Music list retrieved successfully"}), 200
    except Exception as e:
        print(f"GET /api/music error: {e}")
        return jsonify({"message": "Failed to retrieve music list", "error": str(e)}), 500

@music_bp.route('/music', methods=['POST'])
def upload_music():
    if 'file' not in request.files:
        return jsonify({"message": "No file part in the request"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    music_name = request.form.get('music_name')
    author = request.form.get('author')
    category = request.form.get('category')
    tags_str = request.form.get('tags', '')
    tags = [tag.strip() for tag in tags_str.split(',') if tag.strip()]

    if not all([music_name, author, category, file]):
        return jsonify({"message": "Missing required fields"}), 400

    secured_filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{secured_filename}"
    file_path = os.path.normpath(os.path.join(UPLOAD_FOLDER, unique_filename))

    try:
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        file.save(file_path)

        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                INSERT INTO music (music_name, author, category, file_path, tags)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, music_name, author, category, file_path, tags, created_at, updated_at
                """,
                (music_name, author, category, file_path, tags)
            )
            new_music_record = cursor.fetchone()
            return jsonify({"message": "Music uploaded successfully", "data": row_to_dict(new_music_record)}), 201
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        print(f"POST /api/music error: {e}")
        return jsonify({"message": "Failed to upload music", "error": str(e)}), 500

@music_bp.route('/music/<int:music_id>', methods=['PUT'])
def update_music(music_id):
    data = request.get_json()
    set_clauses = []
    values = []

    if 'music_name' in data:
        set_clauses.append("music_name = %s")
        values.append(data['music_name'])
    if 'author' in data:
        set_clauses.append("author = %s")
        values.append(data['author'])
    if 'category' in data:
        set_clauses.append("category = %s")
        values.append(data['category'])
    if 'tags' in data:
        set_clauses.append("tags = %s")
        values.append(data['tags'])

    if not set_clauses:
        return jsonify({"message": "No fields provided for update"}), 400

    set_clauses.append("updated_at = CURRENT_TIMESTAMP")
    values.append(music_id)

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            query = f"UPDATE music SET {', '.join(set_clauses)} WHERE id = %s RETURNING id, music_name, author, category, file_path, tags, created_at, updated_at"
            cursor.execute(query, tuple(values))
            updated_music_record = cursor.fetchone()
            if updated_music_record:
                return jsonify({"message": "Music updated successfully", "data": row_to_dict(updated_music_record)}), 200
            return jsonify({"message": "Music not found or no changes made"}), 404
    except Exception as e:
        print(f"PUT /api/music/{music_id} error: {e}")
        return jsonify({"message": "Failed to update music", "error": str(e)}), 500

@music_bp.route('/music/<int:music_id>', methods=['DELETE'])
def delete_music(music_id):
    try:
        file_path = None
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("SELECT file_path FROM music WHERE id = %s", (music_id,))
            result = cursor.fetchone()
            if result:
                file_path = result['file_path']

        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("DELETE FROM music WHERE id = %s RETURNING id", (music_id,))
            deleted = cursor.fetchone()
            if deleted:
                if file_path and os.path.exists(file_path):
                    os.remove(file_path)
                return jsonify({"message": "Music deleted successfully", "data": {"id": deleted['id']}}), 200
            return jsonify({"message": "Music not found"}), 404
    except Exception as e:
        print(f"DELETE /api/music/{music_id} error: {e}")
        return jsonify({"message": "Failed to delete music", "error": str(e)}), 500

@music_bp.route('/music/serve/<int:music_id>')
def serve_music_file(music_id):
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("SELECT file_path FROM music WHERE id = %s", (music_id,))
            result = cursor.fetchone()
            if not result:
                abort(404, description="Music not found")
            file_path = result['file_path']

        filename = os.path.basename(file_path)
        project_root = os.path.normpath(os.path.join(current_app.root_path, '..'))
        absolute_dir = os.path.normpath(os.path.join(project_root, UPLOAD_FOLDER))
        full_path = os.path.join(absolute_dir, filename)

        if not os.path.exists(full_path):
            abort(404, description="File not found")

        return send_from_directory(absolute_dir, filename)
    except Exception as e:
        print(f"GET /api/music/serve/{music_id} error: {e}")
        abort(500, description=str(e))
