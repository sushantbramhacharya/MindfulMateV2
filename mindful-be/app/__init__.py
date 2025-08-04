import os
from pprint import pp
from flask import Flask
from .routes.auth import auth_bp
from .routes.protected import protected_bp
from flask_cors import CORS

def create_app():
    UPLOAD_FOLDER = 'uploads/music' 
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    app = Flask(__name__)
    CORS(app, supports_credentials=True)
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(protected_bp, url_prefix='/api/protected')
    
    from app.routes.music import music_bp
    app.register_blueprint(music_bp ,url_prefix='/api')

    from app.routes.exercise import exercise_bp
    app.register_blueprint(exercise_bp, url_prefix='/api')

    from app.routes.comments import comments_bp
    app.register_blueprint(comments_bp, url_prefix='/api')

    from app.routes.posts import posts_bp
    app.register_blueprint(posts_bp, url_prefix='/api')

    from app.routes.moods import moods_bp
    app.register_blueprint(moods_bp, url_prefix='/api')

    from app.routes.predict import prediction_bp
    app.register_blueprint(prediction_bp, url_prefix='/api')

    from app.routes.chat_requests import chat_requests_bp
    app.register_blueprint(chat_requests_bp, url_prefix='/api')

    from app.routes.chat import chat_bp
    app.register_blueprint(chat_bp, url_prefix='/api')
    return app