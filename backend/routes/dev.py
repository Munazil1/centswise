# backend/routes/dev.py
from flask import Blueprint, jsonify
from models import User
from extensions import db
from werkzeug.security import generate_password_hash

dev_bp = Blueprint("dev", __name__)

@dev_bp.route("/create-admin")
def create_admin():
    user = User.query.filter_by(username="admin").first()
    if user:
        return jsonify({"message": "Admin already exists"})

    admin = User(
        username="admin",
        password=generate_password_hash("Admin@123"),
        role="admin"
    )
    db.session.add(admin)
    db.session.commit()

    return jsonify({"message": "Admin created"})
