import logging
from typing import List, Dict, Optional, Union
from datetime import datetime
from app.config.db import DBConnection  # Your database connection class

class MusicModel:
    """
    Data access layer for music operations.
    Handles all database interactions for music tracks.
    """
    
    @staticmethod
    def create_music(author: str, category: str, filename: str, tags: List[str]) -> Optional[int]:
        """
        Create a new music entry in the database.
        
        Args:
            author: Name of the author/artist
            category: Music category
            filename: Name of the audio file
            tags: List of tags associated with the music
            
        Returns:
            ID of the created record or None if creation failed
        """
        try:
            with DBConnection.get_cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO music (author, category, filename, tags, created_at)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (author, category, filename, tags, datetime.utcnow())
                )
                return cursor.fetchone()['id']
        except Exception as e:
            logging.error(f"Database error while creating music: {str(e)}")
            return None

    @staticmethod
    def get_music_by_id(music_id: int) -> Optional[Dict]:
        """
        Retrieve a single music record by its ID.
        
        Args:
            music_id: ID of the music record to retrieve
            
        Returns:
            Dictionary with music data or None if not found
        """
        try:
            with DBConnection.get_cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, author, category, filename, tags, created_at
                    FROM music 
                    WHERE id = %s
                    """,
                    (music_id,)
                )
                if result := cursor.fetchone():
                    return dict(result)
                return None
        except Exception as e:
            logging.error(f"Database error while fetching music by ID {music_id}: {str(e)}")
            return None

    @staticmethod
    def get_all_music(limit: int = 100, offset: int = 0) -> List[Dict]:
        """
        Retrieve all music records with pagination.
        
        Args:
            limit: Maximum number of records to return
            offset: Number of records to skip
            
        Returns:
            List of dictionaries with music data
        """
        try:
            with DBConnection.get_cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, author, category, filename, tags, created_at
                    FROM music
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                    """,
                    (limit, offset)
                )
                return [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            logging.error(f"Database error while fetching all music: {str(e)}")
            return []

    @staticmethod
    def update_music(music_id: int, updates: Dict[str, Union[str, List[str]]]) -> bool:
        """
        Update a music record.
        
        Args:
            music_id: ID of the record to update
            updates: Dictionary of fields to update (author, category, tags)
            
        Returns:
            True if update was successful, False otherwise
        """
        if not updates:
            return False

        set_clauses = []
        params = []
        for field, value in updates.items():
            set_clauses.append(f"{field} = %s")
            params.append(value)
        params.append(music_id)

        try:
            with DBConnection.get_cursor() as cursor:
                cursor.execute(
                    f"""
                    UPDATE music 
                    SET {', '.join(set_clauses)}, updated_at = %s
                    WHERE id = %s
                    """,
                    [*params, datetime.utcnow()]
                )
                return cursor.rowcount > 0
        except Exception as e:
            logging.error(f"Database error while updating music {music_id}: {str(e)}")
            return False

    @staticmethod
    def delete_music(music_id: int) -> bool:
        """
        Delete a music record.
        
        Args:
            music_id: ID of the record to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            with DBConnection.get_cursor() as cursor:
                cursor.execute(
                    """
                    DELETE FROM music 
                    WHERE id = %s
                    """,
                    (music_id,)
                )
                return cursor.rowcount > 0
        except Exception as e:
            logging.error(f"Database error while deleting music {music_id}: {str(e)}")
            return False

    @staticmethod
    def search_music(search_term: str, limit: int = 20) -> List[Dict]:
        """
        Search music by author, category, or tags.
        
        Args:
            search_term: Term to search for
            limit: Maximum number of results to return
            
        Returns:
            List of matching music records
        """
        try:
            with DBConnection.get_cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, author, category, filename, tags, created_at
                    FROM music 
                    WHERE author ILIKE %s 
                       OR category ILIKE %s 
                       OR %s = ANY(tags)
                    ORDER BY created_at DESC
                    LIMIT %s
                    """,
                    (f"%{search_term}%", f"%{search_term}%", search_term, limit)
                )
                return [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            logging.error(f"Database error while searching music: {str(e)}")
            return []

    @staticmethod
    def get_music_by_filename(filename: str) -> Optional[Dict]:
        """
        Retrieve music record by filename.
        
        Args:
            filename: Name of the audio file
            
        Returns:
            Dictionary with music data or None if not found
        """
        try:
            with DBConnection.get_cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, author, category, filename, tags, created_at
                    FROM music 
                    WHERE filename = %s
                    """,
                    (filename,)
                )
                if result := cursor.fetchone():
                    return dict(result)
                return None
        except Exception as e:
            logging.error(f"Database error while fetching music by filename {filename}: {str(e)}")
            return None