from flask import Blueprint, request, jsonify, make_response
from datetime import datetime
from app.models.user import UserModel
from app.config.JWTConfig import JWTConfig

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    email = request.form.get('email')
    password = request.form.get('password')
    confirm_password = request.form.get('confirmPassword')
    date_of_birth = request.form.get('dateOfBirth')
    
    # Validation
    if not all([email, password, confirm_password, date_of_birth]):
        return jsonify({'error': 'All fields are required'}), 400
    
    if password != confirm_password:
        return jsonify({'error': 'Passwords do not match'}), 400
    
    try:
        dob = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
        user_id = UserModel.create_user(email, password, dob)
        
        if not user_id:
            return jsonify({'error': 'Email already exists'}), 409
            
        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id
        }), 201
        
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')
    
    if not all([email, password]):
        return jsonify({'error': 'Email and password are required'}), 400
    
    try:
        user = UserModel.verify_user(email, password)
        
        if user:
            # Generate JWT token
            token = JWTConfig.generate_token(user['id'], user['email'])
            
            # Create response
            response = make_response(jsonify({
                'message': 'Login successful',
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    
                }
            }))
            
            # Set HttpOnly cookie
            response.set_cookie(
                JWTConfig.COOKIE_NAME,
                value=token,
                httponly=True,
                secure=True,  # Enable in production with HTTPS
                samesite='Lax',
                max_age=JWTConfig.ACCESS_TOKEN_EXPIRES,
                path='/'
            )
            
            return response
            
        return jsonify({'error': 'Invalid email or password'}), 401
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({'message': 'Logged out successfully'}))
    response.delete_cookie(JWTConfig.COOKIE_NAME)
    return response