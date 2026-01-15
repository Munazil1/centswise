from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Credit, Expense
from datetime import datetime
from sqlalchemy import func

bp = Blueprint('money', __name__, url_prefix='/api/money')

@bp.route('/credits', methods=['POST'])
@jwt_required()
def add_credit():
    """Add a new credit/donation"""
    data = request.get_json()
    
    required_fields = ['donor_name', 'amount', 'purpose']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        credit_date = datetime.strptime(data.get('date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d').date()
        
        credit = Credit(
            donor_name=data['donor_name'],
            amount=float(data['amount']),
            date=credit_date,
            purpose=data['purpose'],
            payment_method=data.get('payment_method'),
            contact_info=data.get('contact_info')
        )
        
        db.session.add(credit)
        db.session.commit()
        
        return jsonify({
            'message': 'Credit added successfully',
            'credit': credit.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/credits', methods=['GET'])
@jwt_required()
def get_credits():
    """Get all credits with optional filters"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Credit.query
    
    if search:
        query = query.filter(
            (Credit.donor_name.ilike(f'%{search}%')) | 
            (Credit.purpose.ilike(f'%{search}%'))
        )
    
    if start_date:
        query = query.filter(Credit.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    
    if end_date:
        query = query.filter(Credit.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    query = query.order_by(Credit.date.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'credits': [credit.to_dict() for credit in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@bp.route('/credits/<int:credit_id>', methods=['GET'])
@jwt_required()
def get_credit(credit_id):
    """Get single credit"""
    credit = Credit.query.get(credit_id)
    if not credit:
        return jsonify({'error': 'Credit not found'}), 404
    return jsonify({'credit': credit.to_dict()}), 200


@bp.route('/expenses', methods=['POST'])
@jwt_required()
def add_expense():
    """Add a new expense"""
    data = request.get_json()
    
    required_fields = ['amount', 'purpose']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        expense_date = datetime.strptime(data.get('date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d').date()
        
        expense = Expense(
            amount=float(data['amount']),
            date=expense_date,
            purpose=data['purpose'],
            category=data.get('category'),
            beneficiary_name=data.get('beneficiary_name'),
            document_path=data.get('document_path')
        )
        
        db.session.add(expense)
        db.session.commit()
        
        return jsonify({
            'message': 'Expense added successfully',
            'expense': expense.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/expenses', methods=['GET'])
@jwt_required()
def get_expenses():
    """Get all expenses with optional filters"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')
    category = request.args.get('category')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Expense.query
    
    if search:
        query = query.filter(
            (Expense.purpose.ilike(f'%{search}%')) | 
            (Expense.beneficiary_name.ilike(f'%{search}%'))
        )
    
    if category:
        query = query.filter(Expense.category == category)
    
    if start_date:
        query = query.filter(Expense.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    
    if end_date:
        query = query.filter(Expense.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    query = query.order_by(Expense.date.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'expenses': [expense.to_dict() for expense in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@bp.route('/balance', methods=['GET'])
@jwt_required()
def get_balance():
    """Get financial balance summary"""
    total_credits = db.session.query(func.sum(Credit.amount)).scalar() or 0
    total_expenses = db.session.query(func.sum(Expense.amount)).scalar() or 0
    balance = total_credits - total_expenses
    
    return jsonify({
        'total_collected': float(total_credits),
        'total_spent': float(total_expenses),
        'available_balance': float(balance)
    }), 200


@bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_all_transactions():
    """Get combined list of credits and expenses"""
    credits = Credit.query.all()
    expenses = Expense.query.all()
    
    transactions = []
    
    for credit in credits:
        transactions.append({
            'id': f'credit-{credit.id}',
            'type': 'credit',
            'date': credit.date.isoformat(),
            'amount': credit.amount,
            'description': f'{credit.donor_name} - {credit.purpose}'
        })
    
    for expense in expenses:
        transactions.append({
            'id': f'expense-{expense.id}',
            'type': 'expense',
            'date': expense.date.isoformat(),
            'amount': -expense.amount,
            'description': expense.purpose
        })
    
    transactions.sort(key=lambda x: x['date'], reverse=True)
    
    return jsonify({'transactions': transactions}), 200
