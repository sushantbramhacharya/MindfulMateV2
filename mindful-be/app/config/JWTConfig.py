import os
import jwt
import datetime
from dotenv import load_dotenv
from functools import wraps
from flask import request, jsonify

load_dotenv()

class JWTConfig:
    """JWT Configuration and Utilities"""
    
    # Configuration
    SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-here')
    ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))  # 1 hour
    COOKIE_NAME = 'access_token'
    ALGORITHM = 'HS256'

    @staticmethod
    def generate_token(user_id, email):
        """Generate a JWT token with user info"""
        payload = {
            'user_id': user_id,
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=JWTConfig.ACCESS_TOKEN_EXPIRES)
        }
        return jwt.encode(payload, JWTConfig.SECRET_KEY, algorithm=JWTConfig.ALGORITHM)

    @staticmethod
    def verify_token(token):
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, JWTConfig.SECRET_KEY, algorithms=[JWTConfig.ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None  # Token expired
        except jwt.InvalidTokenError:
            return None  # Invalid token

    @staticmethod
    def token_required(f):
        """Decorator for protecting routes with JWT and injecting current user"""
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.cookies.get(JWTConfig.COOKIE_NAME)
            
            if not token:
                return jsonify({'error': 'Authorization token missing'}), 401
            
            payload = JWTConfig.verify_token(token)
            if not payload:
                return jsonify({'error': 'Invalid or expired token'}), 401
            
            current_user = {
                'user_id': payload['user_id'],
                'email': payload['email']
            }
            
            # Pass current_user to the decorated function as a kwarg
            return f(current_user=current_user, *args, **kwargs)
        return decorated