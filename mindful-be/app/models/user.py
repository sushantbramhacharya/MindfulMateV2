from werkzeug.security import generate_password_hash, check_password_hash
from app.config.db import DBConnection
import psycopg2

class UserModel:
    @staticmethod
    def create_user(name, email, password, date_of_birth):
        """Create a new user in the database"""
        try:
            with DBConnection.get_cursor() as cursor:
                hashed_password = generate_password_hash(password)
                cursor.execute(
                    """INSERT INTO users (name, email, password_hash, date_of_birth) 
                    VALUES (%s, %s, %s, %s) RETURNING id""",
                    (name, email, hashed_password, date_of_birth)
                )
                return cursor.fetchone()[0]
        except psycopg2.IntegrityError:
            return None  # Email already exists

    @staticmethod
    def get_user_by_email(email):
        """Retrieve a user by email"""
        with DBConnection.get_cursor() as cursor:
            cursor.execute(
                """SELECT id, name, email, password_hash, date_of_birth 
                FROM users WHERE email = %s""",
                (email,)
            )
            result = cursor.fetchone()
            if result:
                return {
                    'id': result[0],
                    'name': result[1],
                    'email': result[2],
                    'password_hash': result[3],
                    'date_of_birth': result[4]
                }
            return None

    @staticmethod
    def verify_user(email, password):
        """Verify user credentials"""
        user = UserModel.get_user_by_email(email)
        print(f"Verifying user: {user}")
        if user and check_password_hash(user['password_hash'], password):
            return user
        return None
