from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Budget, Transaction, User

budgets_bp = Blueprint('budgets', __name__)

@budgets_bp.route('', methods=['GET'])
@jwt_required()
def get_budgets():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    budgets = []
    for b in user.budgets:
        spent = sum(abs(t.amount) for t in user.transactions if t.category == b.name and t.amount < 0)
        budgets.append({
            "id": b.id,
            "name": b.name,
            "limit": b.limit,
            "spent": spent,
            "icon": b.icon,
            "color": b.color,
            "transactions": Transaction.query.filter_by(user_id=current_user_id, category=b.name).count()
        })
        
    return jsonify(budgets)

@budgets_bp.route('', methods=['POST'])
@jwt_required()
def save_budget():
    current_user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    try:
        budget_id = data.get('id')
        if budget_id:
            budget = Budget.query.filter_by(id=budget_id, user_id=current_user_id).first()
            if not budget:
                return jsonify({"status": "error", "message": "Budget not found"}), 404
        else:
            budget = Budget(user_id=current_user_id)
            db.session.add(budget)
            
        budget.name = data.get('name', 'New Category')
        budget.limit = float(data.get('limit', 0))
        budget.icon = data.get('icon', 'fas fa-wallet')
        budget.color = data.get('color', '#3B82F6')
        
        db.session.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@budgets_bp.route('/<int:budget_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(budget_id):
    current_user_id = get_jwt_identity()
    budget = Budget.query.filter_by(id=budget_id, user_id=current_user_id).first()
    if budget:
        db.session.delete(budget)
        db.session.commit()
        return jsonify({"status": "success"})
    return jsonify({"status": "error", "message": "Not found"}), 404
