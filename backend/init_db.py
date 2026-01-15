"""Database initialization script - Creates tables and default admin user"""
from app import app
from extensions import db
from models import AdminUser

def init_database():
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("✓ Tables created!")
        
        # Check if admin exists
        admin = AdminUser.query.filter_by(username='admin').first()
        
        if not admin:
            print("\nCreating default admin user...")
            admin = AdminUser(username='admin', email='admin@syspuratheel.org')
            admin.set_password('Admin@123')
            admin.security_question = 'What is the name of your organization?'
            admin.set_security_answer('SYS Puratheel')
            
            db.session.add(admin)
            db.session.commit()
            
            print("✓ Default admin created!")
            print("\n" + "="*50)
            print("Login Credentials:")
            print("Username: admin")
            print("Password: Admin@123")
            print("="*50)
            print("\n⚠️  Change password after first login!")
        else:
            print("\n✓ Admin user already exists")
        
        print("\n✅ Database ready!")

if __name__ == '__main__':
    init_database()
