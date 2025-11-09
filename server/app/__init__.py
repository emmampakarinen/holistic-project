from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    # Enable CORS for all routes
    CORS(app)
    # Configure database URL
    app.config["DATABASE_URL"] = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@db:3306/holistic")

    # Register blueprints
    from .routes.health import bp as health_bp
    app.register_blueprint(health_bp, url_prefix="/api")
    return app
