from functools import wraps
import jwt
import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 1. Secret key used to sign and verify tokens
app.config['SECRET_KEY'] = 'my-super-secret-key-123'

# 2. The Security Guard (Decorator)
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Look for 'Authorization: Bearer <token>' in the request headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        # If no token was sent, block access (401)
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            # Verify the token using our secret key
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = data['user']
        except Exception:
            # If the token is fake or expired, block access (401)
            return jsonify({'message': 'Token is invalid or expired!'}), 401

        # Token is valid! Let the user enter the route
        return f(current_user, *args, **kwargs)

    return decorated

# 3. The Login Route (Gives out tokens)
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Check if username and password match
    if data and data.get('username') == 'admin' and data.get('password') == '1234':
        token = jwt.encode({
            'user': data['username'],
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({'token': token})

    return jsonify({'message': 'Wrong username or password'}), 401

# In-memory database for testing
tasks = [
    {"id": 1, "title": "Setup VS Code Project", "completed": True},
    {"id": 2, "title": "Connect Flask API", "completed": False}
]

# 4. Protected Routes (Notice @token_required and current_user)
@app.route('/api/tasks', methods=['GET'])
@token_required
def get_tasks(current_user):
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
@token_required
def add_task(current_user):
    new_task = request.get_json()
    tasks.append(new_task)
    return jsonify(new_task), 201

if __name__ == '__main__':
    app.run(debug=True)