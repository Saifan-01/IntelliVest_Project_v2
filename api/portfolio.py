from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Portfolio, Transaction
from datetime import datetime

portfolio_bp = Blueprint('portfolio', __name__)

@portfolio_bp.route('', methods=['GET'])
@jwt_required()
def get_portfolio():
    current_user_id = get_jwt_identity()
    plans = Portfolio.query.filter_by(user_id=current_user_id).all()
    return jsonify([{
        "id": p.id,
        "symbol": p.symbol,
        "company_name": p.company_name,
        "quantity": p.quantity,
        "purchase_price": p.purchase_price,
        "purchase_price_inr": p.purchase_price_inr or p.purchase_price,
        "currency": p.currency or 'INR',
        "exchange_rate": p.exchange_rate or 1.0,
        "date": p.added_at.strftime('%Y-%m-%d')
    } for p in plans])

@portfolio_bp.route('/live', methods=['GET'])
@jwt_required()
def get_portfolio_live():
    current_user_id = get_jwt_identity()
    portfolio = Portfolio.query.filter_by(user_id=current_user_id).all()
    
    if not portfolio:
        return jsonify({"total_cost": 0, "live_value": 0, "pnl": 0, "pnl_percent": 0, "inflow": 0, "outflow": 0})
        
    import yfinance as yf
    symbols = list(set([p.symbol for p in portfolio]))
    
    live_prices = {}
    try:
        import concurrent.futures
        def fetch_live_price(sym):
            try:
                ticker = yf.Ticker(sym)
                return sym, ticker.fast_info.last_price
            except:
                return sym, 0
                
        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            results = executor.map(fetch_live_price, symbols)
            for sym, price in results:
                live_prices[sym] = price
    except Exception as e:
        print("Error fetching live prices:", e)
        
    total_cost = 0
    live_value = 0
    total_profit_inflow = 0
    total_loss_outflow = 0
    
    for p in portfolio:
        # Always use INR price for totals
        inr_purchase_price = p.purchase_price_inr if p.purchase_price_inr else p.purchase_price
        exchange_rate = p.exchange_rate if p.exchange_rate else 1.0
        
        cost = p.quantity * inr_purchase_price
        total_cost += cost
        
        raw_current_price = live_prices.get(p.symbol) or p.purchase_price
        current_price_inr = raw_current_price * exchange_rate
        live_value += p.quantity * current_price_inr
        
        stock_pnl = (current_price_inr - inr_purchase_price) * p.quantity
        if stock_pnl > 0:
            total_profit_inflow += stock_pnl
        elif stock_pnl < 0:
            total_loss_outflow += abs(stock_pnl)
            
    pnl = live_value - total_cost
    pnl_percent = (pnl / total_cost * 100) if total_cost > 0 else 0
    
    return jsonify({
        "total_cost": total_cost,
        "live_value": live_value,
        "pnl": pnl,
        "pnl_percent": pnl_percent,
        "inflow": total_profit_inflow,
        "outflow": total_loss_outflow
    })

@portfolio_bp.route('', methods=['POST'])
@jwt_required()
def save_portfolio():
    current_user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    try:
        qty = float(data.get('quantity', 1.0))
        price = float(data.get('purchase_price', 0.0))     # Price in native currency
        symbol = data.get('symbol')
        currency = data.get('currency', 'INR').upper()
        exchange_rate = float(data.get('exchange_rate', 1.0))  # Rate to INR
        price_inr = price * exchange_rate                  # Converted to INR
        
        new_plan = Portfolio(
            user_id=current_user_id,
            symbol=symbol,
            company_name=data.get('company_name'),
            quantity=qty,
            purchase_price=price,
            purchase_price_inr=price_inr,
            currency=currency,
            exchange_rate=exchange_rate
        )
        db.session.add(new_plan)
        
        # Add transaction for capital allocation (always in INR)
        total_investment_inr = qty * price_inr
        if total_investment_inr > 0:
            tx = Transaction(
                user_id=current_user_id,
                description=f"Purchased {qty} shares of {symbol} ({currency} @ {price:.2f} = ₹{price_inr:.2f})",
                amount=-total_investment_inr,
                category="Investment",
                date=datetime.utcnow()
            )
            db.session.add(tx)
            
        db.session.commit()
        
        return jsonify({"status": "success", "price_inr": price_inr, "exchange_rate": exchange_rate})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@portfolio_bp.route('/<int:plan_id>', methods=['DELETE'])
@jwt_required()
def delete_portfolio(plan_id):
    current_user_id = get_jwt_identity()
    plan = Portfolio.query.filter_by(id=plan_id, user_id=current_user_id).first()
    if plan:
        # Use INR price for the reversal so Total Cost is correctly reduced
        inr_price = plan.purchase_price_inr if plan.purchase_price_inr else plan.purchase_price
        refund_inr = plan.quantity * inr_price
        currency = plan.currency or 'INR'
        
        if refund_inr > 0:
            tx = Transaction(
                user_id=current_user_id,
                description=f"Removed {plan.quantity} shares of {plan.symbol} ({currency} @ {plan.purchase_price:.2f} = ₹{inr_price:.2f})",
                amount=refund_inr,   # Positive = reversal credits back Total Cost
                category="Investment",
                date=datetime.utcnow()
            )
            db.session.add(tx)
            
        db.session.delete(plan)
        db.session.commit()
        return jsonify({"status": "success", "refunded_inr": refund_inr})
    return jsonify({"status": "error", "message": "Not found"}), 404
