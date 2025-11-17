# server_web.py
# This server uses Flask to serve web pages
# and Flask-SocketIO to handle real-time chat.

from flask import Flask, render_template, request
try:
    from flask_socketio import SocketIO, send, emit
except ImportError:
    # If flask_socketio is not installed, provide lightweight stubs for development
    # For full WebSocket support install the package:
    #     pip install flask-socketio
    print("Warning: flask_socketio not found; running with stubbed SocketIO (install flask-socketio for real WebSocket support).")

    class SocketIO:
        def __init__(self, app):
            self.app = app

        def run(self, app, host='127.0.0.1', port=5000, **kwargs):
            # Fallback to Flask built-in server for development (no real socket support)
            allow_unsafe_werkzeug = kwargs.get('allow_unsafe_werkzeug', False)
            # ignore allow_unsafe_werkzeug when using Flask dev server; it's for real SocketIO only
            app.run(host=host, port=port, debug=kwargs.get('debug', False))

    def send(*args, **kwargs):
        # stub: no-op
        return None

    def emit(event, *args, **kwargs):
        # stub: no-op
        return None

# Initialize the Flask app and SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key!' # Change this
socketio = SocketIO(app)

users = {} # A dictionary to store session IDs and usernames

# --- 1. Route to serve the HTML page ---
# This serves your index.html file when someone visits the main URL
@app.route('/')
def index():
    return render_template('index.html')

# --- 2. Handle New Connections ---
# This runs when a new client connects via JavaScript
@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

# --- 3. Handle User Joining ---
# The client will send a 'user_joined' message with their username
@socketio.on('user_joined')
def handle_user_joined(username):
    print(f"Username received: {username}")
    users[request.sid] = username
    
    # Send a "welcome" message to the user who just joined
    emit('server_message', f"Welcome to the chat, {username}!")
    
    # Broadcast to all *other* users that this person joined
    emit('server_message', f"--- {username} has joined the chat ---", broadcast=True, include_self=False)

# --- 4. Handle New Messages ---
# This is the main message handler
@socketio.on('new_message')
def handle_new_message(message_data):
    # message_data will be a dictionary, e.g., {'encrypted_text': 'Khoor'}
    
    # Get the username from our stored dictionary
    username = users.get(request.sid, "Unknown")
    
    # Log it on the server
    print(f"[LOG] Received encrypted message from {username}")
    
    # Prepare the message to broadcast
    # We add the sender's username so the client can display it
    broadcast_data = {
        'username': username,
        'encrypted_text': message_data['encrypted_text']
    }
    
    # Broadcast the encrypted message to all *other* clients
    emit('message_broadcast', broadcast_data, broadcast=True, include_self=False)

# --- 5. Handle Disconnections ---
@socketio.on('disconnect')
def handle_disconnect():
    username = users.pop(request.sid, "Someone")
    print(f"[DISCONNECTED] {username} has left the chat.")
    
    # Broadcast that the user has left
    emit('server_message', f"--- {username} has left the chat ---", broadcast=True)

# --- Script Entry Point ---
if __name__ == '__main__':
    # UPDATED Port from 5555 to 5556
    print("[STARTING] Server is starting on http://127.0.0.1:5556...")
    # Run the Flask-SocketIO server
    # 'allow_unsafe_werkzeug=True' is for dev, remove for production
    socketio.run(app, host='127.0.0.1', port=5556, debug=True, allow_unsafe_werkzeug=True) # <-- UPDATED PORT