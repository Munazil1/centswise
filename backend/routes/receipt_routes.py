from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required
from extensions import db
from models import Receipt, Credit
from datetime import datetime
import os
from utils.pdf_generator import generate_receipt_pdf

bp = Blueprint('receipts', __name__, url_prefix='/api/receipts')

def generate_serial_number():
    """Generate receipt serial number in format RCP-YYYY-NNNN"""
    year = datetime.now().year
    year_start = datetime(year, 1, 1)
    year_end = datetime(year, 12, 31, 23, 59, 59)
    
    count = Receipt.query.filter(
        Receipt.created_at >= year_start,
        Receipt.created_at <= year_end
    ).count()
    
    serial_num = count + 1
    return f"RCP-{year}-{serial_num:04d}"


@bp.route('/generate/<int:credit_id>', methods=['POST'])
@jwt_required()
def generate_receipt(credit_id):
    """Generate receipt for a credit"""
    credit = Credit.query.get(credit_id)
    
    if not credit:
        return jsonify({'error': 'Credit not found'}), 404
    
    if credit.receipt_id:
        return jsonify({'error': 'Receipt already exists for this credit'}), 400
    
    try:
        # Generate serial number
        serial_number = generate_serial_number()
        
        # Create receipt record
        receipt = Receipt(
            serial_number=serial_number,
            donor_name=credit.donor_name,
            amount=credit.amount,
            date=credit.date
        )
        
        db.session.add(receipt)
        db.session.flush()
        
        # Generate actual PDF file
        pdf_filename = f'{serial_number}.pdf'
        pdf_relative_path = f'receipts/{pdf_filename}'
        pdf_full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], pdf_relative_path)
        
        # Generate the PDF
        generate_receipt_pdf(receipt, pdf_full_path)
        
        # Store the relative path in database
        receipt.pdf_path = pdf_relative_path
        
        # Link receipt to credit
        credit.receipt_id = receipt.id
        
        db.session.commit()
        
        return jsonify({
            'message': 'Receipt generated successfully',
            'receipt': receipt.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:receipt_id>', methods=['GET'])
@jwt_required()
def get_receipt(receipt_id):
    """Get receipt details"""
    receipt = Receipt.query.get(receipt_id)
    
    if not receipt:
        return jsonify({'error': 'Receipt not found'}), 404
    
    return jsonify({'receipt': receipt.to_dict()}), 200


@bp.route('', methods=['GET'])
@jwt_required()
def get_receipts():
    """Get all receipts with pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')
    
    query = Receipt.query
    
    if search:
        query = query.filter(
            (Receipt.donor_name.ilike(f'%{search}%')) |
            (Receipt.serial_number.ilike(f'%{search}%'))
        )
    
    query = query.order_by(Receipt.date.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'receipts': [receipt.to_dict() for receipt in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@bp.route('/download/<int:receipt_id>', methods=['GET'])
@jwt_required()
def download_receipt(receipt_id):
    """Download receipt PDF"""
    receipt = Receipt.query.get(receipt_id)
    
    if not receipt:
        return jsonify({'error': 'Receipt not found'}), 404
    
    if not receipt.pdf_path:
        return jsonify({'error': 'PDF not generated yet'}), 404
    
    pdf_full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], receipt.pdf_path)
    
    if not os.path.exists(pdf_full_path):
        return jsonify({'error': 'PDF file not found'}), 404
    
    return send_file(
        pdf_full_path,
        as_attachment=True,
        download_name=f"{receipt.serial_number}.pdf",
        mimetype='application/pdf'
    )
