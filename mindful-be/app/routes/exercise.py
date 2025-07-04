# myapp/exercise.py
from flask import Blueprint, request, jsonify, send_from_directory, abort, current_app
from werkzeug.utils import secure_filename
from app.config.db import DBConnection
import uuid
import os
from datetime import datetime
import json

UPLOAD_FOLDER = os.path.normpath('uploads/exercises')

exercise_bp = Blueprint('exercise', __name__)

def row_to_dict(row):
    if not row:
        return None
    data = dict(row)
    if 'steps' in data and data['steps'] is None:
        data['steps'] = []
    if 'id' in data:
        data['video_url'] = f'http://localhost:5000/api/exercises/serve/{data["id"]}'
    return data

@exercise_bp.route('/exercises', methods=['GET'])
def get_exercises():
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT id, title, category, duration, description, steps, video_path, created_at, updated_at
                FROM exercise ORDER BY created_at DESC
            """)
            results = cursor.fetchall()
            return jsonify({"data": [row_to_dict(r) for r in results]}), 200
    except Exception as e:
        return jsonify({"message": "Failed to fetch exercises", "error": str(e)}), 500

@exercise_bp.route('/exercises', methods=['POST'])
def upload_exercise():
    if 'video' not in request.files:
        return jsonify({"message": "No video uploaded"}), 400
    video = request.files['video']
    if video.filename == '':
        return jsonify({"message": "No video selected"}), 400

    title = request.form.get('title')
    category = request.form.get('category')
    duration = request.form.get('duration')
    description = request.form.get('description')
    steps = json.loads(request.form.get('steps', '[]'))

    if not all([title, category, duration, description]):
        return jsonify({"message": "Missing required fields"}), 400

    safe_name = secure_filename(video.filename)
    unique_name = f"{uuid.uuid4().hex}_{safe_name}"
    video_path = os.path.normpath(os.path.join(UPLOAD_FOLDER, unique_name))

    try:
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        video.save(video_path)

        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("""
                INSERT INTO exercise (title, category, duration, description, steps, video_path)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, title, category, duration, description, steps, video_path, created_at, updated_at
            """, (title, category, duration, description, steps, video_path))
            new_row = cursor.fetchone()
            return jsonify({"message": "Exercise uploaded", "data": row_to_dict(new_row)}), 201
    except Exception as e:
        if os.path.exists(video_path):
            os.remove(video_path)
        return jsonify({"message": "Upload failed", "error": str(e)}), 500

@exercise_bp.route('/exercises/<int:exercise_id>', methods=['DELETE'])
def delete_exercise(exercise_id):
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("SELECT video_path FROM exercise WHERE id = %s", (exercise_id,))
            result = cursor.fetchone()
            if not result:
                return jsonify({"message": "Exercise not found"}), 404
            video_path = result['video_path']

            cursor.execute("DELETE FROM exercise WHERE id = %s RETURNING id", (exercise_id,))
            deleted = cursor.fetchone()

            if video_path and os.path.exists(video_path):
                os.remove(video_path)

            return jsonify({"message": "Deleted", "data": {"id": deleted['id']}}), 200
    except Exception as e:
        return jsonify({"message": "Delete failed", "error": str(e)}), 500

@exercise_bp.route('/exercises/serve/<int:exercise_id>', methods=['GET'])
def serve_video(exercise_id):
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("SELECT video_path FROM exercise WHERE id = %s", (exercise_id,))
            result = cursor.fetchone()
            if not result:
                abort(404, description="Exercise not found")
            full_path = result['video_path']
            filename = os.path.basename(full_path)

        abs_dir = os.path.dirname(os.path.join(current_app.root_path, '..', full_path))
        return send_from_directory(abs_dir, filename)
    except Exception as e:
        abort(500, description=str(e))
@exercise_bp.route('/exercises/<int:exercise_id>', methods=['PUT'])
def update_exercise(exercise_id):
    video = request.files.get('video')

    title = request.form.get('title')
    category = request.form.get('category')
    duration = request.form.get('duration')
    description = request.form.get('description')
    steps = json.loads(request.form.get('steps', '[]'))

    if not all([title, category, duration, description]):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            # Fetch current video_path to delete old video if replaced
            cursor.execute("SELECT video_path FROM exercise WHERE id = %s", (exercise_id,))
            existing = cursor.fetchone()
            if not existing:
                return jsonify({"message": "Exercise not found"}), 404

            video_path = existing['video_path']

            # If new video uploaded, save and delete old
            if video and video.filename != '':
                safe_name = secure_filename(video.filename)
                unique_name = f"{uuid.uuid4().hex}_{safe_name}"
                new_video_path = os.path.normpath(os.path.join(UPLOAD_FOLDER, unique_name))

                if not os.path.exists(UPLOAD_FOLDER):
                    os.makedirs(UPLOAD_FOLDER)
                video.save(new_video_path)

                # Delete old video file
                if video_path and os.path.exists(video_path):
                    os.remove(video_path)

                video_path = new_video_path

            # Update exercise record
            cursor.execute("""
                UPDATE exercise SET title=%s, category=%s, duration=%s, description=%s, steps=%s, video_path=%s, updated_at=NOW()
                WHERE id=%s
                RETURNING id, title, category, duration, description, steps, video_path, created_at, updated_at
            """, (title, category, duration, description, steps, video_path, exercise_id))

            updated_row = cursor.fetchone()
            return jsonify({"message": "Exercise updated", "data": row_to_dict(updated_row)}), 200

    except Exception as e:
        return jsonify({"message": "Update failed", "error": str(e)}), 500
