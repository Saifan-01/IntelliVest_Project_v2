from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models import db, Transaction, User

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('', methods=['GET'])
@jwt_required()
def get_transactions():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    transactions = Transaction.query.filter_by(user_id=current_user_id).order_by(Transaction.date.desc()).all()
    
    income = sum(t.amount for t in transactions if t.amount > 0)
    expenses = sum(abs(t.amount) for t in transactions if t.amount < 0)
    current_savings = user.initial_balance + income - expenses
    
    tx_list = []
    for t in transactions[:50]: # Last 50
        tx_list.append({
            "id": t.id,
            "desc": t.description,
            "amt": t.amount,
            "date": t.date.strftime('%Y-%m-%d'),
            "cat": t.category
        })
        
    import calendar
    
    # Calculate realistic chart data for the last 6 months
    today = datetime.today()
    chart_labels = []
    chart_data = []
    
    months_list = []
    for i in range(5, -1, -1):
        m = today.month - i
        y = today.year
        if m <= 0:
            m += 12
            y -= 1
        months_list.append((y, m, calendar.month_abbr[m]))
        
    start_date = datetime(months_list[0][0], months_list[0][1], 1)
    
    tx_chronological = sorted(transactions, key=lambda x: x.date)
    older_txs = [t for t in tx_chronological if t.date < start_date]
    running_balance = user.initial_balance + sum(t.amount for t in older_txs)
    
    for y, m, name in months_list:
        monthly_txs = [t for t in tx_chronological if t.date.year == y and t.date.month == m]
        running_balance += sum(t.amount for t in monthly_txs)
        chart_labels.append(name)
        chart_data.append(running_balance)
        
    return jsonify({
        "balance": current_savings,
        "income": income,
        "expenses": expenses,
        "transactions": tx_list,
        "chart": {
            "labels": chart_labels,
            "data": chart_data
        }
    })

@transactions_bp.route('', methods=['POST'])
@jwt_required()
def add_transaction():
    current_user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    try:
        new_tx = Transaction(
            user_id=current_user_id,
            description=data.get('description', 'Untitled'),
            amount=float(data.get('amount', 0)),
            category=data.get('category', 'General'),
            date=datetime.now()
        )
        db.session.add(new_tx)
        db.session.commit()
        return jsonify({"status": "success", "message": "Transaction added"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@transactions_bp.route('/<int:tx_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(tx_id):
    current_user_id = get_jwt_identity()
    tx = Transaction.query.filter_by(id=tx_id, user_id=current_user_id).first()
    if tx:
        db.session.delete(tx)
        db.session.commit()
        return jsonify({"status": "success"})
    return jsonify({"status": "error", "message": "Not found"}), 404
