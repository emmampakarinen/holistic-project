import os

from flask import Flask
from flask_cors import CORS

from .routes.health import bp as health_bp
from .routes.users import bp as users_bp
from .routes.find_charger import bp as logic_bp

def create_app():
    app = Flask(__name__)
    
    # enable CORS for all routes
    CORS(app)
    
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(users_bp, url_prefix="/api")
    app.register_blueprint(logic_bp, url_prefix="/api")

    return app
