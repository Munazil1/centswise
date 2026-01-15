from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models import AdminUser
from datetime import datetime

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    """Admin login endpoint"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    # Find admin user
    admin = AdminUser.query.filter_by(username=username).first()
    
    if not admin:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Check for too many failed attempts
    if admin.failed_login_attempts >= 5:
        return jsonify({'error': 'Account locked. Please reset your password.'}), 403
    
    # Verify password
    if not admin.check_password(password):
        admin.failed_login_attempts += 1
        db.session.commit()
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Successful login
    admin.failed_login_attempts = 0
    admin.last_login = datetime.utcnow()
    db.session.commit()
    
    # Create access token
    access_token = create_access_token(identity=admin.id)
    
    return jsonify({
        'access_token': access_token,
        'user': admin.to_dict()
    }), 200


@bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change admin password"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('current_password') or not data.get('new_password'):
        return jsonify({'error': 'Current and new password are required'}), 400
    
    admin = AdminUser.query.get(current_user_id)
    if not admin:
        return jsonify({'error': 'User not found'}), 404
    
    # Verify current password
    if not admin.check_password(data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Validate new password
    new_password = data['new_password']
    if len(new_password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    # Update password
    admin.set_password(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200


@bp.route('/reset-password-request', methods=['POST'])
def reset_password_request():
    """Request password reset using security question"""
    data = request.get_json()
    
    if not data or not data.get('username'):
        return jsonify({'error': 'Username is required'}), 400
    
    admin = AdminUser.query.filter_by(username=data['username']).first()
    if not admin or not admin.security_question:
        return jsonify({'error': 'Unable to process request'}), 400
    
    return jsonify({
        'security_question': admin.security_question,
        'username': admin.username
    }), 200


@bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password using security answer"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('security_answer') or not data.get('new_password'):
        return jsonify({'error': 'All fields are required'}), 400
    
    admin = AdminUser.query.filter_by(username=data['username']).first()
    if not admin:
        return jsonify({'error': 'Invalid request'}), 400
    
    # Verify security answer
    if not admin.check_security_answer(data['security_answer']):
        return jsonify({'error': 'Security answer is incorrect'}), 401
    
    # Validate new password
    if len(data['new_password']) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    # Reset password
    admin.set_password(data['new_password'])
    admin.failed_login_attempts = 0
    db.session.commit()
    
    return jsonify({'message': 'Password reset successfully'}), 200


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    current_user_id = get_jwt_identity()
    admin = AdminUser.query.get(current_user_id)
    
    if not admin:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': admin.to_dict()}), 200
