from flask import Flask, jsonify
from datetime import timedelta
import os

# Import extensions
from extensions import db, jwt, migrate, cors

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///centswise.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')

# Initialize extensions with app
db.init_app(app)
jwt.init_app(app)
migrate.init_app(app, db)
cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'receipts'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'documents'), exist_ok=True)

# Import routes
from routes import auth_routes, money_routes, property_routes, dashboard_routes, receipt_routes

# Register blueprints
app.register_blueprint(auth_routes.bp)
app.register_blueprint(money_routes.bp)
app.register_blueprint(property_routes.bp)
app.register_blueprint(dashboard_routes.bp)
app.register_blueprint(receipt_routes.bp)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Authorization token is missing'}), 401

# Initialize database and create admin user on startup
with app.app_context():
    try:
        # Import models to ensure they're registered
        from models import AdminUser, Credit, Expense, Item, Distribution, Receipt
        
        # Create all tables
        db.create_all()
        print("✓ Database tables created/verified")
        
        # Create default admin user if not exists
        admin = AdminUser.query.filter_by(username='admin').first()
        if not admin:
            from werkzeug.security import generate_password_hash
            admin = AdminUser(
                username='admin',
                password_hash=generate_password_hash('Admin@123'),
                email='admin@centswise.local'
            )
            db.session.add(admin)
            db.session.commit()
            print("✓ Default admin user created")
        else:
            print("✓ Admin user already exists")
    except Exception as e:
        print(f"⚠ Error during initialization: {e}")

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'CentsWise API is running'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
