import json, uuid, boto3, os
from datetime import datetime
from decimal import Decimal

# Initialize AWS Resources
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])
sfn = boto3.client('stepfunctions')

class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert Decimal objects to JSON for Step Functions/API responses"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def handler(event, context):
    # Standard headers for CORS
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    }

    # Handle OPTIONS request (CORS preflight)
    if event.get('httpMethod') == 'OPTIONS':
        return {"statusCode": 200, "headers": headers, "body": ""}

    try:
        # Extract user info from Cognito Authorizer claims
        claims = event['requestContext']['authorizer']['claims']
        user_id = claims['sub']
        user_email = claims.get('email', 'unknown@example.com')
        
        body = json.loads(event['body'])
        
        # 1. Extract structured data from frontend payload
        items_data = body.get('items', [])
        delivery_info = body.get('delivery_details', {})
        totals_info = body.get('totals', {})

        # 2. Process Items and calculate subtotal
        processed_items = []
        calculated_subtotal = Decimal('0')

        for item in items_data:
            # Matches your CartContext keys: 'price' and 'quantity'
            qty = Decimal(str(item.get('quantity', 1)))
            price = Decimal(str(item.get('price', 0)))
            
            item_total = (qty * price).quantize(Decimal('0.01'))
            calculated_subtotal += item_total
            
            processed_items.append({
                "product_id": item.get('id'),
                "name": item.get('name', 'Unknown Item'),
                "cutType": item.get('cutType', 'STANDARD_CUT'),
                "price_per_unit": price,
                "quantity": qty,
                "item_total": item_total,
                "image": item.get('image', '')
            })

        # 4. Final Total Calculation
        # Default delivery to 5.00 if not provided
        delivery_charge = Decimal(str(totals_info.get('delivery_charge', 5.00))).quantize(Decimal('0.01'))
        final_total = calculated_subtotal + delivery_charge

        order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.now().isoformat() 

        # 5. Build the Item for DynamoDB
        # Using 'createdAt' to match the frontend Orders.jsx sorting logic
        order_item = {
            "userId": user_id,           # Partition Key
            "orderId": order_id,         # Sort Key
            "createdAt": timestamp,      # Used for frontend display
            "user_email": user_email,
            "items": processed_items,
            "subtotal": calculated_subtotal,
            "delivery_charge": delivery_charge,
            "total": final_total,        # Match frontend 'order.total'
            "status": "PENDING_PAYMENT",
            
            # Delivery Mapping
            "delivery_location": delivery_info.get('location', 'N/A'),
            "postal_code": str(delivery_info.get('postal_code', '')), 
            "delivery_instructions": delivery_info.get('delivery_instructions', 'None'),
            "contact_number": delivery_info.get('contact', 'N/A')
        }

        # 6. Save to DynamoDB
        table.put_item(Item=order_item)

        # 7. Trigger Step Function (Workflow for Payment/Email/Inventory)
        if os.environ.get('STATE_MACHINE_ARN'):
            sfn.start_execution(
                stateMachineArn=os.environ['STATE_MACHINE_ARN'],
                input=json.dumps(order_item, cls=DecimalEncoder)
            )

        # 8. Success Response
        return {
            "statusCode": 201,
            "headers": headers,
            "body": json.dumps({
                "message": "Order created successfully",
                "orderId": order_id,
                "total": final_total
            }, cls=DecimalEncoder)
        }

    except KeyError as e:
        print(f"Auth Error: Missing claim {str(e)}")
        return {
            "statusCode": 401,
            "headers": headers,
            "body": json.dumps({"error": "Unauthorized", "details": "Missing user identity"})
        }
    except Exception as e:
        print(f"Error Processing Order: {str(e)}")
        return {
            "statusCode": 500, 
            "headers": headers,
            "body": json.dumps({"error": "Internal Server Error", "details": str(e)})
        }