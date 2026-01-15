from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Credit, Expense, Item, Distribution
from sqlalchemy import func

bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@bp.route('/metrics', methods=['GET'])
@jwt_required()
def get_dashboard_metrics():
    """Get key metrics for dashboard"""
    
    # Financial metrics
    total_collected = db.session.query(func.sum(Credit.amount)).scalar() or 0
    total_spent = db.session.query(func.sum(Expense.amount)).scalar() or 0
    available_balance = total_collected - total_spent
    
    # Property metrics
    total_items = db.session.query(func.sum(Item.total_quantity)).scalar() or 0
    available_items = db.session.query(func.sum(Item.available_quantity)).scalar() or 0
    distributed_items = total_items - available_items
    
    # Recent transactions
    recent_credits = Credit.query.order_by(Credit.date.desc()).limit(5).all()
    recent_expenses = Expense.query.order_by(Expense.date.desc()).limit(5).all()
    
    recent_transactions = []
    
    for credit in recent_credits:
        recent_transactions.append({
            'id': f'credit-{credit.id}',
            'type': 'credit',
            'date': credit.date.isoformat(),
            'amount': credit.amount,
            'description': f'{credit.donor_name} - {credit.purpose}'
        })
    
    for expense in recent_expenses:
        recent_transactions.append({
            'id': f'expense-{expense.id}',
            'type': 'expense',
            'date': expense.date.isoformat(),
            'amount': -expense.amount,
            'description': expense.purpose
        })
    
    recent_transactions.sort(key=lambda x: x['date'], reverse=True)
    recent_transactions = recent_transactions[:10]
    
    # Active distributions
    active_distributions = Distribution.query.filter_by(status='distributed').count()
    
    return jsonify({
        'financial': {
            'total_collected': float(total_collected),
            'total_spent': float(total_spent),
            'available_balance': float(available_balance)
        },
        'inventory': {
            'total_items': int(total_items),
            'available_items': int(available_items),
            'distributed_items': int(distributed_items),
            'active_distributions': active_distributions
        },
        'recent_transactions': recent_transactions
    }), 200


@bp.route('/financial-summary', methods=['GET'])
@jwt_required()
def get_financial_summary():
    """Get detailed financial summary"""
    # Category-wise expenses
    expense_by_category = db.session.query(
        Expense.category,
        func.sum(Expense.amount).label('total')
    ).group_by(Expense.category).all()
    
    categories = {}
    for category, total in expense_by_category:
        categories[category or 'Other'] = float(total)
    
    # Payment method breakdown
    payment_methods = db.session.query(
        Credit.payment_method,
        func.sum(Credit.amount).label('total')
    ).group_by(Credit.payment_method).all()
    
    methods = {}
    for method, total in payment_methods:
        methods[method or 'Unknown'] = float(total)
    
    total_credits = db.session.query(func.sum(Credit.amount)).scalar() or 0
    total_expenses = db.session.query(func.sum(Expense.amount)).scalar() or 0
    
    return jsonify({
        'summary': {
            'total_credits': float(total_credits),
            'total_expenses': float(total_expenses),
            'net_balance': float(total_credits - total_expenses)
        },
        'expense_by_category': categories,
        'credits_by_payment_method': methods
    }), 200


@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_statistics():
    """Get various statistics"""
    
    # Donor statistics
    total_donors = db.session.query(func.count(func.distinct(Credit.donor_name))).scalar() or 0
    total_donations = Credit.query.count()
    avg_donation = db.session.query(func.avg(Credit.amount)).scalar() or 0
    
    top_donors = db.session.query(
        Credit.donor_name,
        func.sum(Credit.amount).label('total')
    ).group_by(Credit.donor_name).order_by(func.sum(Credit.amount).desc()).limit(5).all()
    
    # Item statistics
    total_item_types = Item.query.count()
    
    return jsonify({
        'donors': {
            'total_unique_donors': total_donors,
            'total_donations': total_donations,
            'average_donation': float(avg_donation),
            'top_donors': [{'name': name, 'total': float(total)} for name, total in top_donors]
        },
        'items': {
            'total_item_types': total_item_types
        }
    }), 200
