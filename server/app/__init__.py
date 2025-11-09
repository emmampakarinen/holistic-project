from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config["DATABASE_URL"] = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@db:3306/holistic")
    from .routes.health import bp as health_bp
    app.register_blueprint(health_bp, url_prefix="/api")
    return app
