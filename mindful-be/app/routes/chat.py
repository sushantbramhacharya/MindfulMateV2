from flask import Blueprint, jsonify, request, redirect
from app.config.db import DBConnection
from app.config.JWTConfig import JWTConfig
from datetime import datetime
import requests
import json

chat_bp = Blueprint('chat', __name__)

def message_row_to_dict(row):
    return {
        "id": row["id"],
        "sender_id": row["sender_id"],
        "receiver_id": row["receiver_id"],
        "content": row["content"],
        "timestamp": row["timestamp"].isoformat() if row["timestamp"] else None,
    }

# GET chat count for current user
@chat_bp.route('/chat-count', methods=['GET'])
@JWTConfig.token_required
def get_chat_count(current_user):
    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute(
                "SELECT chat_count FROM users WHERE id = %s",
                (current_user['user_id'],)
            )
            result = cursor.fetchone()
            if result is None:
                return jsonify({"message": "User not found"}), 404
            return jsonify({"chat_count": result['chat_count']}), 200
    except Exception as e:
        print(f"GET /chat-count error: {e}")
        return jsonify({"message": "Failed to retrieve chat count"}), 500

# POST send message (requires chat_count > 0)
@chat_bp.route('/messages', methods=['POST'])
@JWTConfig.token_required
def send_message(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"message": "Missing JSON body"}), 400

    sender_id = current_user['user_id']
    content = data.get('content')

    if not content:
        return jsonify({"message": "content is required"}), 400

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            # Check chat count
            cursor.execute(
                "SELECT chat_count FROM users WHERE id = %s",
                (sender_id,)
            )
            user_row = cursor.fetchone()
            if user_row is None:
                return jsonify({"message": "User not found"}), 404
            if user_row['chat_count'] <= 0:
                return jsonify({"message": "You have no chats remaining"}), 403

            # Send message to expert (id = 8)
            cursor.execute("""
                INSERT INTO messages (sender_id, receiver_id, content, timestamp)
                VALUES (%s, %s, %s, %s)
                RETURNING id, sender_id, receiver_id, content, timestamp
            """, (sender_id, 8, content, datetime.utcnow()))
            message_row = cursor.fetchone()

            # Decrement chat count
            cursor.execute(
                "UPDATE users SET chat_count = chat_count - 1 WHERE id = %s",
                (sender_id,)
            )

            return jsonify({"message": "Message sent", "data": message_row_to_dict(message_row)}), 201

    except Exception as e:
        print(f"POST /messages error: {e}")
        return jsonify({"message": "Failed to send message"}), 500

# GET messages between expert and specific user
@chat_bp.route('/messages/<user_id>', methods=['GET'])
@JWTConfig.token_required
def get_messages_with_user(current_user, user_id):
    # Only allow expert (ID = 8) to view other users’ chats
    if str(current_user['user_id']) != "8":
        return jsonify({"message": "Unauthorized"}), 403

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT id, sender_id, receiver_id, content, timestamp
                FROM messages
                WHERE (sender_id = %s AND receiver_id = 8)
                   OR (sender_id = 8 AND receiver_id = %s)
                ORDER BY timestamp ASC
            """, (user_id, user_id))
            rows = cursor.fetchall()
            messages = []
            for row in rows:
                message = message_row_to_dict(row)
                message['sender_type'] = 'expert' if row['sender_id'] == 8 else 'user'
                messages.append(message)
            return jsonify(messages), 200
    except Exception as e:
        print(f"GET /messages/<user_id> error: {e}")
        return jsonify({"message": "Failed to fetch messages"}), 500
    
@chat_bp.route('/messages', methods=['GET'])
@JWTConfig.token_required
def get_my_messages(current_user):
    user_id = current_user['user_id']
    expert_id = 8

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT id, sender_id, receiver_id, content, timestamp
                FROM messages
                WHERE (sender_id = %s AND receiver_id = %s)
                   OR (sender_id = %s AND receiver_id = %s)
                ORDER BY timestamp ASC
            """, (user_id, expert_id, expert_id, user_id))
            rows = cursor.fetchall()

            messages = []
            for row in rows:
                message = message_row_to_dict(row)
                message['sender_type'] = 'user' if row['sender_id'] == user_id else 'expert'
                messages.append(message)

            return jsonify(messages), 200
    except Exception as e:
        print(f"GET /messages error: {e}")
        return jsonify({"message": "Failed to fetch messages"}), 500

@chat_bp.route('/expert/messages/<int:user_id>', methods=['POST'])
@JWTConfig.token_required
def expert_send_message(current_user, user_id):
    # Only allow expert to send messages via this route
    if str(current_user['user_id']) != "8":
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    if not data or not data.get('content'):
        return jsonify({"message": "Content is required"}), 400

    content = data['content']

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            # Insert message from expert (8) to user_id
            cursor.execute("""
                INSERT INTO messages (sender_id, receiver_id, content, timestamp)
                VALUES (%s, %s, %s, %s)
                RETURNING id, sender_id, receiver_id, content, timestamp
            """, (8, user_id, content, datetime.utcnow()))
            message_row = cursor.fetchone()

            return jsonify({
                "message": "Message sent",
                "data": message_row_to_dict(message_row)
            }), 201
    except Exception as e:
        print(f"POST /expert/messages/<user_id> error: {e}")
        return jsonify({"message": "Failed to send message"}), 500

@chat_bp.route('/expert/users', methods=['GET'])
@JWTConfig.token_required
def get_accepted_users(current_user):
    # Only expert can access this
    if str(current_user['user_id']) != "8":
        return jsonify({"message": "Unauthorized"}), 403

    try:
        with DBConnection.get_cursor(dictionary=True) as cursor:
            # Get distinct user IDs with their latest message timestamp
            cursor.execute("""
                SELECT 
                    CASE
                        WHEN sender_id = 8 THEN receiver_id
                        ELSE sender_id
                    END AS user_id,
                    MAX(timestamp) AS latest_timestamp
                FROM messages
                WHERE sender_id = 8 OR receiver_id = 8
                GROUP BY 
                    CASE
                        WHEN sender_id = 8 THEN receiver_id
                        ELSE sender_id
                    END
            """)
            user_data = cursor.fetchall()
            
            if not user_data:
                return jsonify([]), 200
            
            # Get user details for these IDs
            user_ids = [row['user_id'] for row in user_data]
            format_strings = ",".join(["%s"] * len(user_ids))
            cursor.execute(f"""
                SELECT id AS user_id, name
                FROM users
                WHERE id IN ({format_strings})
            """, tuple(user_ids))
            users = cursor.fetchall()
            
            # Sort users by latest timestamp
            timestamp_lookup = {row['user_id']: row['latest_timestamp'] for row in user_data}
            users.sort(key=lambda x: timestamp_lookup.get(x['user_id'], ''), reverse=True)
            
            return jsonify(users), 200
    except Exception as e:
        print(f"GET /expert/users error: {e}")
        return jsonify({"message": "Failed to fetch users"}), 500

@chat_bp.route('/buy-messages', methods=['POST'])
@JWTConfig.token_required
def buy_messages(current_user):
    try:
        data = request.get_json()
        print(f"POST /buy-messages request data: {data}")
        if not data or not data.get('chat_credits') or not data.get('amount'):
            return jsonify({"message": "chat_credits and amount are required"}), 400

        chat_credits = int(data['chat_credits'])
        amount = int(data['amount'])  # Amount in paisa (e.g., 1000 = NPR 10)
        user_id = current_user['user_id']
        print(f"POST /buy-messages user_id: {user_id}, chat_credits: {chat_credits}, amount: {amount}")

        if chat_credits <= 0 or amount < 1000:  # Khalti minimum is NPR 10 (1000 paisa)
            return jsonify({"message": "Invalid chat_credits or amount (minimum NPR 10)"}), 400

        with DBConnection.get_connection() as conn, conn.cursor() as cursor:
            print("POST /buy-messages: Opened database connection")
            # Fetch user details for Khalti customer_info
            cursor.execute(
                "SELECT name, email FROM users WHERE id = %s",
                (user_id,)
            )
            user = cursor.fetchone()
            print(f"POST /buy-messages: User query result: {user}")
            if not user:
                return jsonify({"message": "User not found"}), 404

            # Create purchase record (omit pidx)
            cursor.execute("""
                INSERT INTO purchases (user_id, amount, chat_credits, status)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, (user_id, amount, chat_credits, 'pending'))
            purchase_id = cursor.fetchone()[0]
            print(f"POST /buy-messages: Inserted purchase record with id: {purchase_id}")

            # Initiate Khalti payment
            url = "https://dev.khalti.com/api/v2/epayment/initiate/"
            payload = json.dumps({
                "return_url": "http://localhost:5000/api/messages/purchase/complete",
                "website_url": "https://example.com",
                "amount": str(amount),
                "purchase_order_id": f"chat_purchase_{purchase_id}",
                "purchase_order_name": f"{chat_credits} Chat Credits",
                "customer_info": {
                    "name": user[0] or "Anonymous",  # Index 0 for name
                    "email": user[1] or "user@example.com",  # Index 1 for email
                    "phone": current_user.get('phone', '9800000001')
                }
            })
            headers = {
                'Authorization': 'key e030ba49d9194a86924ca3949324be02',
                'Content-Type': 'application/json'
            }
            print(f"POST /buy-messages: Sending Khalti request with payload: {payload}")
            response = requests.post(url, headers=headers, data=payload)
            response_data = response.json()
            print(f"POST /buy-messages: Khalti response: {response.status_code}, {response_data}")

            if response.status_code != 200 or 'pidx' not in response_data:
                cursor.execute("UPDATE purchases SET status = %s WHERE id = %s", ('failed', purchase_id))
                return jsonify({"message": "Failed to initiate payment", "error": response_data.get('error_key', 'Unknown error')}), 500

            # Update purchase with pidx
            cursor.execute(
                "UPDATE purchases SET pidx = %s WHERE id = %s",
                (response_data['pidx'], purchase_id)
            )
            conn.commit()
            print(f"POST /buy-messages: Updated purchase with pidx: {response_data['pidx']}")

            return jsonify({
                "message": "Payment initiated",
                "payment_url": response_data['payment_url'],
                "pidx": response_data['pidx']
            }), 200

    except Exception as e:
        print(f"POST /buy-messages error: {e}")
        return jsonify({"message": "Failed to initiate payment"}), 500
    
@chat_bp.route('/messages/purchase/complete', methods=['GET'])
@JWTConfig.token_required
def purchase_complete(current_user):
    try:
        # Extract query parameters directly
        pidx = request.args.get('pidx')
        transaction_id = request.args.get('transaction_id')
        amount = request.args.get('amount', type=int)
        chat_credits = amount/2500  # Hardcoded or derive based on amount/purchase_order_id

        print(f"GET /messages/purchase/complete (no verification): pidx={pidx}, txn_id={transaction_id}, amount={amount}, user_id={current_user['user_id']}")

        if not pidx or not transaction_id or not amount:
            return jsonify({"message": "Missing required payment details"}), 400

        with DBConnection.get_connection() as conn, conn.cursor() as cursor:
            print("Opened DB connection")

            # Check if the purchase already exists and is completed
            cursor.execute(
                "SELECT id, status FROM purchases WHERE pidx = %s",
                (pidx,)
            )
            existing = cursor.fetchone()

            if existing:
                purchase_id, status = existing
                if status == "completed":
                    print("Purchase already completed.")
                    return jsonify({"message": "Purchase already processed"}), 200

                # Update existing purchase to completed
                cursor.execute(
                    "UPDATE purchases SET status = %s, transaction_id = %s WHERE id = %s",
                    ("completed", transaction_id, purchase_id)
                )
            else:
                # Insert new purchase record
                cursor.execute(
                    """
                    INSERT INTO purchases (pidx, user_id, amount, status, transaction_id, chat_credits)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (pidx, current_user['user_id'], amount, "completed", transaction_id, chat_credits)
                )

            # Increment user's chat_count
            cursor.execute(
                "UPDATE users SET chat_count = chat_count + %s WHERE id = %s",
                (chat_credits, current_user["user_id"])
            )
            conn.commit()
            print(f"User {current_user['user_id']} chat_count incremented by {chat_credits}")

        return redirect("http://localhost:5173/chat-expert")

    except Exception as e:
        print(f"Error processing payment: {e}")
        return jsonify({"message": "Internal server error"}), 500
