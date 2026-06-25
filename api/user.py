from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Transaction, Portfolio
from datetime import datetime

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    transactions = Transaction.query.filter_by(user_id=current_user_id).all()
    portfolio = Portfolio.query.filter_by(user_id=current_user_id).all()
    
    total_trades = len(transactions)
    total_inflow = sum(t.amount for t in transactions if t.amount > 0 and t.category != 'Deposit')
    total_outflow = sum(t.amount for t in transactions if t.amount < 0)
    
    # Calculate Risk Profile based on portfolio length and trading frequency
    if total_trades > 50:
        risk_profile = "Aggressive Active Trader"
        risk_color = "#FF3366"
    elif total_trades > 20:
        risk_profile = "Tactical Investor"
        risk_color = "#4CC9F0"
    elif len(portfolio) > 0:
        risk_profile = "Calculated Accumulator"
        risk_color = "#39FF14"
    else:
        risk_profile = "New Operator"
        risk_color = "#9D4EDD"

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "joined": user.created_at.strftime('%b %d, %Y'),
        "metrics": {
            "total_trades": total_trades,
            "total_inflow": round(total_inflow, 2),
            "total_outflow": round(abs(total_outflow), 2),
            "active_positions": len(portfolio)
        },
        "ai_analysis": {
            "risk_profile": risk_profile,
            "risk_color": risk_color,
            "assessment": f"Algorithm identifies user behavior as '{risk_profile}'. Based on telemetry from {total_trades} recorded actions, current strategy favors continuous accumulation." if total_trades > 0 else "Insufficient telemetry for deep behavioral analysis. Execute trades to generate risk matrix."
        }
    })
