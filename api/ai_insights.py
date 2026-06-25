from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Transaction, Budget, User, Portfolio
import os
import google.genai as genai

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/insights', methods=['GET'])
@jwt_required()
def get_insights():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    transactions = Transaction.query.filter_by(user_id=current_user_id).order_by(Transaction.date.desc()).limit(30).all()
    budgets = Budget.query.filter_by(user_id=current_user_id).all()
    portfolio = Portfolio.query.filter_by(user_id=current_user_id).all()
    
    tx_summary = "\\n".join([f"{t.date.strftime('%Y-%m-%d')}: {t.description} (₹{t.amount}) [{t.category}]" for t in transactions])
    bg_summary = "\\n".join([f"{b.name}: Limit ₹{b.limit}, Spent ₹{b.spent}" for b in budgets])
    
    # Get live prices for portfolio
    port_summary = ""
    if portfolio:
        import yfinance as yf
        symbols = [p.symbol for p in portfolio]
        tickers = yf.Tickers(' '.join(symbols))
        
        port_lines = []
        for p in portfolio:
            current_price = "Unknown"
            try:
                current_price = tickers.tickers[p.symbol].fast_info.last_price
            except:
                pass
            port_lines.append(f"Asset: {p.symbol} ({p.company_name}), Qty: {p.quantity}, Bought At: ₹{p.purchase_price}, Current Market Price: ₹{current_price}")
        port_summary = "\\n".join(port_lines)
    else:
        port_summary = "No assets currently tracked in portfolio."
    
    # Get trending stocks to recommend
    trending_summary = "No trending data."
    try:
        from .market import get_trending_data
        # We can just fetch trending directly or via similar logic
        trending_data = get_trending_data('usa') + get_trending_data('india')
        trending_summary = "\\n".join([f"{t['symbol']} ({t['name']}) - Price: {t['price']}, Change: {t['change']}%" for t in trending_data[:5]])
    except Exception as e:
        pass
    
    prompt = f"""
    You are an expert financial advisor AI for 'IntelliVest'. 
    Analyze the following user's recent financial data, budget, and currently held investment portfolio.
    
    Provide exactly 3 short, highly actionable pieces of advice. 
    Since they have an investment portfolio, AT LEAST ONE piece of advice MUST strictly recommend whether to HOLD, SELL, or BUY MORE of a specific asset they own, mathematically comparing their 'Bought At' price to the 'Current Market Price'. Provide realistic logic for your trade recommendation.
    AT LEAST ONE piece of advice MUST recommend a new asset from the Trending Stocks list to buy, explaining why.
    
    Recent Transactions:
    {tx_summary}
    
    Budgets:
    {bg_summary}
    
    Current Investment Portfolio (Live Data):
    {port_summary}
    
    Trending Stocks (For Recommendations):
    {trending_summary}
    
    Output format strictly JSON:
    [
      {{"action": "SELL", "asset": "AAPL", "title": "Trade Alert: Sell AAPL", "description": "Details..."}},
      {{"action": "BUY", "asset": "RELIANCE", "title": "Trending Opportunity", "description": "Details..."}},
      {{"action": "HOLD", "asset": "CASH", "title": "General Advice", "description": "Details..."}}
    ]
    IMPORTANT: The 'action' field MUST be one of: "BUY", "SELL", or "HOLD".
    """
    
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return jsonify([
            {"title": "Setup Required", "description": "Please configure GEMINI_API_KEY to receive AI insights."}
        ])
        
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        import json
        import re
        
        # Extract JSON from markdown
        text = response.text
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            advice = json.loads(match.group(0))
            return jsonify(advice)
        return jsonify([{"title": "Error", "description": "Failed to parse AI response."}])
    except Exception as e:
        return jsonify([{"title": "Error", "description": str(e)}])
