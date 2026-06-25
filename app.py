import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_socketio import SocketIO
from models import db
import yfinance as yf
import time

migrate = Migrate()
socketio = SocketIO(cors_allowed_origins="*")

def fetch_market_data_task():
    tickers = {
        "SENSEX": "^BSESN",
        "NIFTY 50": "^NSEI",
        "BANK NIFTY": "^NSEBANK",
        "NASDAQ": "^IXIC"
    }
    while True:
        data = []
        for name, symbol in tickers.items():
            try:
                ticker = yf.Ticker(symbol)
                price = ticker.fast_info.last_price
                prev = ticker.fast_info.previous_close
                change_p = ((price - prev) / prev) * 100
                data.append({
                    "name": name,
                    "price": round(price, 2),
                    "change": round(change_p, 2),
                    "symbol": symbol
                })
            except:
                pass
        if data:
            socketio.emit('market_update', data)
        socketio.sleep(15)

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for Next.js frontend
    CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'intellivest_secure_v3_key_reset_final')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'intellivest-jwt-secret-key')
    from datetime import timedelta
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = db_url or ('sqlite:///' + os.path.join(basedir, 'finance_v2.db'))
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    JWTManager(app)
    socketio.init_app(app)

    # Start background task
    socketio.start_background_task(fetch_market_data_task)

    # Register Blueprints
    from api.auth import auth_bp
    from api.transactions import transactions_bp
    from api.budgets import budgets_bp
    from api.portfolio import portfolio_bp
    from api.market import market_bp
    from api.ai_insights import ai_bp
    from api.stock_intel import stock_intel_bp
    from api.user import user_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(budgets_bp, url_prefix='/api/budgets')
    app.register_blueprint(portfolio_bp, url_prefix='/api/portfolio')
    app.register_blueprint(market_bp, url_prefix='/api/market')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(stock_intel_bp, url_prefix='/api/intel')
    app.register_blueprint(user_bp, url_prefix='/api/user')

    @app.route('/api/health')
    def health_check():
        return jsonify({"status": "healthy"}), 200

    # Ensure DB tables exist on startup (optional if using Flask-Migrate, but good for dev)
    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    socketio.run(app, debug=True, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True, use_reloader=False)
