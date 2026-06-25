from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    
    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token, user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "initials": ''.join([n[0] for n in user.name.split()[:2]]).upper()
        }), 200
    
    return jsonify({"msg": "Bad email or password"}), 401

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    name = data.get('name')
    password = data.get('password')
    
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already exists"}), 400
        
    new_user = User(
        email=email, 
        name=name, 
        password=generate_password_hash(password, method='pbkdf2:sha256'),
        initial_balance=0.0
    )
    db.session.add(new_user)
    db.session.commit()
    
    # Optional: seed data could be called here or handled separately
    # from utils import seed_data
    # seed_data(new_user.id)
    
    access_token = create_access_token(identity=str(new_user.id))
    return jsonify(access_token=access_token, user={
        "id": new_user.id,
        "email": new_user.email,
        "name": new_user.name,
        "initials": ''.join([n[0] for n in new_user.name.split()[:2]]).upper()
    }), 201

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    if not user:
        return jsonify({"msg": "User not found"}), 404
    return jsonify({
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "initials": ''.join([n[0] for n in user.name.split()[:2]]).upper(),
        "initial_balance": user.initial_balance
    }), 200

@auth_bp.route('/me/balance', methods=['PUT'])
@jwt_required()
def update_balance():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    data = request.get_json(silent=True) or {}
    
    try:
        new_balance = float(data.get('initial_balance', user.initial_balance))
        user.initial_balance = new_balance
        db.session.commit()
        return jsonify({"status": "success", "initial_balance": user.initial_balance})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
