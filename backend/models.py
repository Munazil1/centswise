from extensions import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class AdminUser(db.Model):
    __tablename__ = 'admin_users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    security_question = db.Column(db.String(255), nullable=True)
    security_answer_hash = db.Column(db.String(255), nullable=True)
    failed_login_attempts = db.Column(db.Integer, default=0)
    last_login = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def set_security_answer(self, answer):
        self.security_answer_hash = generate_password_hash(answer.lower())
    
    def check_security_answer(self, answer):
        return check_password_hash(self.security_answer_hash, answer.lower())
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }


class Credit(db.Model):
    __tablename__ = 'credits'
    
    id = db.Column(db.Integer, primary_key=True)
    donor_name = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    purpose = db.Column(db.Text, nullable=False)
    payment_method = db.Column(db.String(50), nullable=True)
    contact_info = db.Column(db.String(255), nullable=True)
    receipt_id = db.Column(db.Integer, db.ForeignKey('receipts.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    receipt = db.relationship('Receipt', backref='credit', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'donor_name': self.donor_name,
            'amount': self.amount,
            'date': self.date.isoformat(),
            'purpose': self.purpose,
            'payment_method': self.payment_method,
            'contact_info': self.contact_info,
            'receipt_serial': self.receipt.serial_number if self.receipt else None,
            'created_at': self.created_at.isoformat()
        }


class Expense(db.Model):
    __tablename__ = 'expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    purpose = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=True)
    beneficiary_name = db.Column(db.String(255), nullable=True)
    document_path = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'date': self.date.isoformat(),
            'purpose': self.purpose,
            'category': self.category,
            'beneficiary_name': self.beneficiary_name,
            'document_path': self.document_path,
            'created_at': self.created_at.isoformat()
        }


class Item(db.Model):
    __tablename__ = 'items'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    total_quantity = db.Column(db.Integer, nullable=False, default=1)
    available_quantity = db.Column(db.Integer, nullable=False, default=1)
    condition = db.Column(db.String(50), nullable=True)
    location = db.Column(db.String(255), nullable=True)
    photo_path = db.Column(db.String(500), nullable=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    distributions = db.relationship('Distribution', backref='item', lazy=True, cascade='all, delete-orphan')
    
    @property
    def distributed_quantity(self):
        return self.total_quantity - self.available_quantity
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'total_quantity': self.total_quantity,
            'available_quantity': self.available_quantity,
            'distributed_quantity': self.distributed_quantity,
            'condition': self.condition,
            'location': self.location,
            'photo_path': self.photo_path,
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }


class Distribution(db.Model):
    __tablename__ = 'distributions'
    
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    recipient_name = db.Column(db.String(255), nullable=False)
    recipient_contact = db.Column(db.String(255), nullable=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    distribution_date = db.Column(db.Date, nullable=False)
    expected_return_date = db.Column(db.Date, nullable=True)
    actual_return_date = db.Column(db.Date, nullable=True)
    return_condition = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='distributed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'item_id': self.item_id,
            'item_name': self.item.name if self.item else None,
            'recipient_name': self.recipient_name,
            'recipient_contact': self.recipient_contact,
            'quantity': self.quantity,
            'distribution_date': self.distribution_date.isoformat(),
            'expected_return_date': self.expected_return_date.isoformat() if self.expected_return_date else None,
            'actual_return_date': self.actual_return_date.isoformat() if self.actual_return_date else None,
            'return_condition': self.return_condition,
            'notes': self.notes,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }


class Receipt(db.Model):
    __tablename__ = 'receipts'
    
    id = db.Column(db.Integer, primary_key=True)
    serial_number = db.Column(db.String(50), unique=True, nullable=False)
    donor_name = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    pdf_path = db.Column(db.String(500), nullable=True)
    emailed_to = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'serial_number': self.serial_number,
            'donor_name': self.donor_name,
            'amount': self.amount,
            'date': self.date.isoformat(),
            'pdf_path': self.pdf_path,
            'emailed_to': self.emailed_to,
            'created_at': self.created_at.isoformat()
        }
