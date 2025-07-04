# app/config/db.py
import psycopg2
from psycopg2 import extras # Still needed for RealDictCursor in other modules
import os
from dotenv import load_dotenv # Import load_dotenv
from contextlib import contextmanager

load_dotenv() # Load environment variables from .env file

class DBConnection:
    """Database connection handler class"""
    
    @staticmethod
    def get_connection_params():
        """Return connection parameters from environment variables"""
        return {
            'dbname': os.getenv('DB_NAME'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'host': os.getenv('DB_HOST')
        }

    @staticmethod
    @contextmanager
    def get_connection():
        """Get a database connection with context management"""
        conn = None
        try:
            conn = psycopg2.connect(**DBConnection.get_connection_params())
            yield conn
        except psycopg2.Error as e:
            print(f"Database connection failed: {e}")
            raise
        finally:
            if conn:
                conn.close()

    @staticmethod
    @contextmanager
    def get_cursor(dictionary=False): # Added 'dictionary' parameter back for flexibility
        """
        Get a database cursor with context management.
        If dictionary=True, returns a RealDictCursor.
        """
        with DBConnection.get_connection() as conn:
            cursor = None
            try:
                if dictionary:
                    cursor = conn.cursor(cursor_factory=extras.RealDictCursor)
                else:
                    cursor = conn.cursor()
                yield cursor
                conn.commit() # Commit changes if no exceptions
            except Exception as e:
                conn.rollback() # Rollback on any exception
                print(f"Database operation failed: {e}")
                raise
            finally:
                if cursor:
                    cursor.close()

