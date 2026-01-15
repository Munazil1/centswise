from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Item, Distribution
from datetime import datetime

bp = Blueprint('property', __name__, url_prefix='/api/property')

@bp.route('/items', methods=['POST'])
@jwt_required()
def add_item():
    """Add new item to inventory"""
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Item name is required'}), 400
    
    try:
        total_qty = int(data.get('total_quantity', 1))
        
        item = Item(
            name=data['name'],
            category=data.get('category'),
            total_quantity=total_qty,
            available_quantity=total_qty,
            condition=data.get('condition'),
            location=data.get('location'),
            photo_path=data.get('photo_path'),
            description=data.get('description')
        )
        
        db.session.add(item)
        db.session.commit()
        
        return jsonify({
            'message': 'Item added successfully',
            'item': item.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/items', methods=['GET'])
@jwt_required()
def get_items():
    """Get all items with filters"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    category = request.args.get('category')
    status = request.args.get('status')
    
    query = Item.query
    
    if search:
        query = query.filter(
            (Item.name.ilike(f'%{search}%')) |
            (Item.description.ilike(f'%{search}%'))
        )
    
    if category:
        query = query.filter(Item.category == category)
    
    if status == 'available':
        query = query.filter(Item.available_quantity > 0)
    elif status == 'distributed':
        query = query.filter(Item.available_quantity == 0)
    
    query = query.order_by(Item.name)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'items': [item.to_dict() for item in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@bp.route('/items/<int:item_id>', methods=['GET'])
@jwt_required()
def get_item(item_id):
    """Get single item details"""
    item = Item.query.get(item_id)
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    distributions = Distribution.query.filter_by(item_id=item_id).all()
    
    return jsonify({
        'item': item.to_dict(),
        'distributions': [d.to_dict() for d in distributions]
    }), 200


@bp.route('/distributions', methods=['POST'])
@jwt_required()
def distribute_item():
    """Distribute an item"""
    data = request.get_json()
    
    required_fields = ['item_id', 'recipient_name', 'distribution_date']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        item = Item.query.get(data['item_id'])
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        quantity = int(data.get('quantity', 1))
        
        if item.available_quantity < quantity:
            return jsonify({'error': f'Only {item.available_quantity} items available'}), 400
        
        dist_date = datetime.strptime(data['distribution_date'], '%Y-%m-%d').date()
        expected_return = None
        if data.get('expected_return_date'):
            expected_return = datetime.strptime(data['expected_return_date'], '%Y-%m-%d').date()
        
        distribution = Distribution(
            item_id=data['item_id'],
            recipient_name=data['recipient_name'],
            recipient_contact=data.get('recipient_contact'),
            quantity=quantity,
            distribution_date=dist_date,
            expected_return_date=expected_return,
            notes=data.get('notes'),
            status='distributed'
        )
        
        item.available_quantity -= quantity
        
        db.session.add(distribution)
        db.session.commit()
        
        return jsonify({
            'message': 'Item distributed successfully',
            'distribution': distribution.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/distributions', methods=['GET'])
@jwt_required()
def get_distributions():
    """Get all distributions"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    search = request.args.get('search', '')
    
    query = Distribution.query
    
    if status:
        query = query.filter(Distribution.status == status)
    
    if search:
        query = query.filter(
            (Distribution.recipient_name.ilike(f'%{search}%')) |
            (Distribution.recipient_contact.ilike(f'%{search}%'))
        )
    
    query = query.order_by(Distribution.distribution_date.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'distributions': [d.to_dict() for d in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@bp.route('/distributions/<int:dist_id>/return', methods=['POST'])
@jwt_required()
def return_item(dist_id):
    """Mark item as returned"""
    distribution = Distribution.query.get(dist_id)
    
    if not distribution:
        return jsonify({'error': 'Distribution not found'}), 404
    
    if distribution.status == 'returned':
        return jsonify({'error': 'Item already returned'}), 400
    
    data = request.get_json() or {}
    
    try:
        return_date = datetime.now().date()
        if data.get('return_date'):
            return_date = datetime.strptime(data['return_date'], '%Y-%m-%d').date()
        
        distribution.status = 'returned'
        distribution.actual_return_date = return_date
        distribution.return_condition = data.get('return_condition')
        
        if data.get('notes'):
            distribution.notes = (distribution.notes or '') + '\nReturn: ' + data['notes']
        
        item = Item.query.get(distribution.item_id)
        if item:
            item.available_quantity += distribution.quantity
        
        db.session.commit()
        
        return jsonify({
            'message': 'Item returned successfully',
            'distribution': distribution.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
