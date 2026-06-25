from datetime import datetime
from models import db, Transaction, Budget

def seed_data(user_id):
    # Add some dummy transactions
    t1 = Transaction(user_id=user_id, description="Opening Balance", amount=50000.00, category="Income", date=datetime.now())
    t2 = Transaction(user_id=user_id, description="Netflix", amount=-650.00, category="Entertainment", date=datetime.now())
    db.session.add_all([t1, t2])
    
    # Add dummy budgets
    b1 = Budget(user_id=user_id, name="Groceries", limit=15000, spent=8000, icon="fas fa-shopping-basket", color="#10B981")
    b2 = Budget(user_id=user_id, name="Entertainment", limit=5000, spent=1200, icon="fas fa-film", color="#8B5CF6")
    b3 = Budget(user_id=user_id, name="Dining Out", limit=8000, spent=4500, icon="fas fa-utensils", color="#EF4444")
    db.session.add_all([b1, b2, b3])
    
    db.session.commit()
