import random

def handler(event, context):
    """
    Simulated Payment Handler for Bulk Orders.
    The 'event' now contains the full order object from the Step Function trigger.
    """
    
    # 1. Extract the identifiers needed for the Composite Key
    order_id = event.get("orderId")
    user_id = event.get("userId")
    
    # 2. Extract the price (useful for logging or real payment gateway calls)
    total_to_charge = event.get("total_price", 0)
    
    print(f"Processing payment for Order: {order_id} | User: {user_id} | Amount: ${total_to_charge}")

    # 3. Simulated Payment Logic
    # In production, you'd call: stripe.Charge.create(amount=total_to_charge, ...)
    success = random.choices([True, False], weights=[0.9, 0.1])[0] # 90% success rate

    if success:
        return {
            "status": "PAID", 
            "orderId": order_id, 
            "userId": user_id,
            "amount_charged": total_to_charge
        }
    else:
        return {
            "status": "PAYMENT_FAILED", 
            "orderId": order_id, 
            "userId": user_id,
            "error_message": "Insufficient funds or card declined"
        }