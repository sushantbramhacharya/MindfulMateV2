# myapp/music.py
from flask import Blueprint, request, jsonify, send_from_directory, abort, current_app # Import current_app
from datetime import datetime
import uuid
import os
from werkzeug.utils import secure_filename # Import secure_filename

# Import DBConnection from the new app/config/db.py
from app.config.db import DBConnection

# Define UPLOAD_FOLDER relative to the project root.
# Ensure it's normalized right at definition for consistency.
# This path is used for storing in the DB and constructing relative paths.
UPLOAD_FOLDER = os.path.normpath('uploads/music') 

# Create a Blueprint for music-related routes
music_bp = Blueprint('music', __name__)

# Helper function to convert database row to dictionary (for consistency and adding file_url)
def row_to_dict(row):
    """
    Converts a database row (from RealDictCursor) to a dictionary,
    handling specific type conversions like tags (TEXT[] to list).
    Adds simulated filename and file_url.
    """
    if not row:
        return None
    
    # row is already a dictionary if using RealDictCursor
    data = dict(row) # Ensure it's a mutable dictionary

    # Ensure 'tags' is a list, even if it's None from DB
    if 'tags' in data and data['tags'] is None:
        data['tags'] = []
    
    # Add a simulated file_url for the frontend
    # Now points to the new route that serves by music ID
    if 'id' in data: # Use 'id' to construct the new file_url
        data['file_url'] = f'http://localhost:5000/api/music/serve/{data["id"]}'
    
    # Keep filename for display purposes in the table
    if 'file_path' in data:
        data['filename'] = os.path.basename(data['file_path'])
    
    return data

# GET all music records
@music_bp.route('/music', methods=['GET'])
def get_music():
    """
    Retrieves all music records from the PostgreSQL database.
    """
    try:
        # Use DBConnection context manager to get a cursor that returns dictionaries
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("SELECT id, author, category, file_path, tags, created_at, updated_at FROM music ORDER BY created_at DESC")
            music_records = cursor.fetchall()
            
            # Convert records to desired dictionary format for frontend
            music_list = [row_to_dict(record) for record in music_records]
            
            return jsonify({"data": music_list, "message": "Music list retrieved successfully"}), 200
    except Exception as e:
        print(f"An error occurred during GET /api/music: {e}")
        return jsonify({"message": "Failed to retrieve music list from database", "error": str(e)}), 500

# POST a new music record
@music_bp.route('/music', methods=['POST'])
def upload_music():
    """
    Uploads a new music file metadata to the PostgreSQL database.
    Saves the file to the UPLOAD_FOLDER using a unique and secured filename.
    """
    if 'file' not in request.files:
        return jsonify({"message": "No file part in the request"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    author = request.form.get('author')
    category = request.form.get('category')
    tags_str = request.form.get('tags', '')
    tags = [tag.strip() for tag in tags_str.split(',') if tag.strip()]

    if not all([author, category, file]):
        return jsonify({"message": "Missing required fields: author, category, file"}), 400

    # Sanitize the filename and add a UUID prefix for uniqueness
    secured_filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{secured_filename}" # Prepend UUID for absolute uniqueness
    
    # Construct the file_path and normalize it before saving and storing in DB
    # This path is relative to the project root (where main.py is run)
    file_path = os.path.normpath(os.path.join(UPLOAD_FOLDER, unique_filename))

    print(f"Attempting to save file to: {file_path}") # Debug print
    
    try:
        # Ensure the UPLOAD_FOLDER exists before saving
        # This will create 'uploads/music' relative to where the Flask app is run (e.g., my_flask_app/)
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
            print(f"Created UPLOAD_FOLDER: {UPLOAD_FOLDER}")

        # Save the file to the specified UPLOAD_FOLDER
        file.save(file_path)
        print(f"File saved successfully: {file_path}") # Debug print
        
        # Insert record into DB *including* the normalized file_path
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute(
                "INSERT INTO music (author, category, file_path, tags) VALUES (%s, %s, %s, %s) RETURNING id, author, category, file_path, tags, created_at, updated_at",
                (author, category, file_path, tags) # Store the full normalized path
            )
            new_music_record = cursor.fetchone() # Fetch the newly inserted record

            if new_music_record:
                return jsonify({"message": "Music uploaded successfully", "data": row_to_dict(new_music_record)}), 201
            else:
                # This case should ideally not happen if initial insert was successful
                return jsonify({"message": "Failed to retrieve new music record after insertion"}), 500

    except Exception as e:
        # If any error occurs (file save or DB insert), attempt to clean up the saved file
        print(f"An error occurred during POST /api/music: {e}")
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"Cleaned up unsaved file: {file_path}")
            except Exception as cleanup_e:
                print(f"Error during file cleanup of {file_path}: {cleanup_e}")
        return jsonify({"message": "Failed to upload music to database", "error": str(e)}), 500

# PUT (update) an existing music record
@music_bp.route('/music/<int:music_id>', methods=['PUT'])
def update_music(music_id):
    """
    Updates an existing music record identified by music_id in the PostgreSQL database.
    """
    data = request.get_json()
    
    set_clauses = []
    values = []

    if 'author' in data:
        set_clauses.append("author = %s")
        values.append(data['author'])
    if 'category' in data:
        set_clauses.append("category = %s")
        values.append(data['category'])
    if 'tags' in data:
        set_clauses.append("tags = %s")
        values.append(data['tags']) # psycopg2 handles list to TEXT[] conversion

    if not set_clauses:
        return jsonify({"message": "No fields provided for update"}), 400

    set_clauses.append("updated_at = CURRENT_TIMESTAMP") # Always update timestamp
    
    values.append(music_id) # Add music_id for WHERE clause

    try:
        # Use DBConnection context manager for database update
        with DBConnection.get_cursor(dictionary=True) as cursor:
            query = f"UPDATE music SET {', '.join(set_clauses)} WHERE id = %s RETURNING id, author, category, file_path, tags, created_at, updated_at"
            cursor.execute(query, tuple(values))
            
            updated_music_record = cursor.fetchone()

            if updated_music_record:
                return jsonify({"message": "Music updated successfully", "data": row_to_dict(updated_music_record)}), 200
            else:
                return jsonify({"message": "Music not found or no changes made"}), 404

    except Exception as e:
        print(f"An error occurred during PUT /api/music/{music_id}: {e}")
        return jsonify({"message": "Failed to update music in database", "error": str(e)}), 500

# DELETE a music record
@music_bp.route('/music/<int:music_id>', methods=['DELETE'])
def delete_music(music_id):
    """
    Deletes a music record identified by music_id from the PostgreSQL database.
    """
    try:
        # First, retrieve the file_path to delete the actual file
        file_to_delete_path = None
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("SELECT file_path FROM music WHERE id = %s", (music_id,))
            result = cursor.fetchone()
            if result:
                file_to_delete_path = result['file_path']

        # Use DBConnection context manager for database deletion
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("DELETE FROM music WHERE id = %s RETURNING id", (music_id,))
            deleted_row = cursor.fetchone()

            if deleted_row:
                # If database record deleted, attempt to delete the file
                if file_to_delete_path and os.path.exists(file_to_delete_path):
                    try:
                        os.remove(file_to_delete_path)
                        print(f"Successfully deleted file: {file_to_delete_path}")
                    except Exception as file_e:
                        print(f"Error deleting file {file_to_delete_path}: {file_e}")
                        # Log the file deletion error but don't fail the API call
                        # as the database record is already gone.

                return jsonify({"message": "Music deleted successfully", "data": {"id": deleted_row['id']}}), 200
            else:
                return jsonify({"message": "Music not found"}), 404

    except Exception as e:
        print(f"An error occurred during DELETE /api/music/{music_id}: {e}")
        return jsonify({"message": "Failed to delete music from database", "error": str(e)}), 500

# Route to serve uploaded music files by ID from the blueprint
@music_bp.route('/music/serve/<int:music_id>') 
def serve_music_file(music_id):
    """
    Serves an uploaded music file based on its ID.
    Retrieves the file_path from the database using the music_id.
    """
    file_path_from_db = None
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("SELECT file_path FROM music WHERE id = %s", (music_id,))
            result = cursor.fetchone()
            if result:
                # The file_path stored in the DB is already relative to the project root
                file_path_from_db = result['file_path']
            else:
                print(f"Music with ID {music_id} not found in database.")
                abort(404, description="Music file not found in database.")

        if file_path_from_db:
            # Extract only the filename from the stored path (e.g., '3b58f9a03b264c7a87effbdb22e73cbe_hutaocoffin-gbd-2024-12-21-05-56-52.mp3')
            filename = os.path.basename(file_path_from_db)

            # Construct the absolute path to the UPLOAD_FOLDER relative to the project root.
            # current_app.root_path points to the directory of the 'myapp' package (e.g., D:\...\my_flask_app\myapp)
            # We need to go up one level ('..') to reach 'my_flask_app\'
            # Then join with the UPLOAD_FOLDER ('uploads/music')
            project_root_path = os.path.normpath(os.path.join(current_app.root_path, '..'))
            absolute_upload_folder = os.path.normpath(os.path.join(project_root_path, UPLOAD_FOLDER))
            
            print(f"Attempting to serve file: {filename} from absolute directory: {absolute_upload_folder}") # Debug print
            full_file_path_check = os.path.join(absolute_upload_folder, filename) # Reconstruct for debug check
            if not os.path.exists(full_file_path_check):
                print(f"File does NOT exist at: {full_file_path_check}") # Debug print
                abort(404, description=f"File not found on server at {full_file_path_check}")
            else:
                print(f"File DOES exist at: {full_file_path_check}") # Debug print
                # Use the absolute path for the directory argument
                return send_from_directory(absolute_upload_folder, filename)
        else:
            abort(404, description="File path not found for this music ID.")

    except Exception as e:
        print(f"Error serving music file for ID {music_id}: {e}")
        # Use abort for proper HTTP error responses
        abort(500, description=f"An error occurred while serving the music file: {e}")

