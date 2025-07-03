from flask import Blueprint, jsonify
from app.config.JWTConfig import JWTConfig

protected_bp = Blueprint('protected', __name__)

@protected_bp.route('/profile', methods=['GET'])
@JWTConfig.token_required
def profile():
    return jsonify({
        'message': 'Protected data',
    })