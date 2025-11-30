import os

from flask import Flask
from flask_cors import CORS

from .routes.database_health_check import bp as health_bp
from .routes.users_operations import bp as users_bp
from .routes.find_charger import bp as logic_bp
from .routes.get_available_evs import bp as evs_get_bp
from .routes.get_charging_details import bp as get_charging_details_bp
from .routes.charger_reviews import bp as charger_reviews_bp

def create_app():
    app = Flask(__name__)
    
    # enable CORS for all routes
    CORS(app)
    
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(users_bp, url_prefix="/api")
    app.register_blueprint(logic_bp, url_prefix="/api")
    app.register_blueprint(evs_get_bp, url_prefix="/api")
    app.register_blueprint(get_charging_details_bp, url_prefix="/api")
    app.register_blueprint(charger_reviews_bp, url_prefix="/api")

    return app
