import os
from flask import Flask
from config import Config
from extensions import db, login_manager, migrate

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Ensure the instance folder exists (for SQLite)
    os.makedirs(app.instance_path, exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = 'info'

    with app.app_context():
        # Import models so SQLAlchemy knows about them
        from models import user, course, enrollment, file
        
        # We will create tables via Flask-Migrate or db.create_all() during local test
        db.create_all()

    # Register Blueprints
    from routes.auth import auth_bp
    app.register_blueprint(auth_bp)
    
    from routes.student import student_bp
    app.register_blueprint(student_bp)
    
    from routes.admin import admin_bp
    app.register_blueprint(admin_bp)

    from routes.files import files_bp
    app.register_blueprint(files_bp)

    @app.route('/')
    def index():
        from flask_login import current_user
        from flask import redirect, url_for
        if current_user.is_authenticated:
            if current_user.role == 'admin':
                return redirect(url_for('admin.dashboard'))
            return redirect(url_for('student.dashboard'))
        return redirect(url_for('auth.login'))

    @app.route('/ping')
    def ping():
        return "Pong! App is running."

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
