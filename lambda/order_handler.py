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
            # Conversion to string first is the safest way to create Decimals in Python
            weight = Decimal(str(item.get('weight', 0)))
            price = Decimal(str(item.get('price_per_kg', 0)))
            qty = int(item.get('quantity', 1))
            
            item_total = (weight * price * qty).quantize(Decimal('0.01'))
            calculated_subtotal += item_total
            
            processed_items.append({
                "cut_type": item.get('cut_type', 'WHOLE_CHICKEN'),
                "weight_kg": weight,
                "price_per_kg": price,
                "quantity": qty,
                "item_total": item_total
            })

        # 3. Final Total Calculation
        delivery_charge = Decimal(str(totals_info.get('delivery_charge', 5.00))).quantize(Decimal('0.01'))
        final_total = calculated_subtotal + delivery_charge

        order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}" # Cleaner Order ID
        order_at = datetime.now().isoformat() 

        # 4. Build the Item for DynamoDB (Matches Composite Key: userId + orderId)
        item = {
            "userId": user_id,           # Partition Key
            "orderId": order_id,         # Sort Key
            "order_at": order_at,
            "user_email": user_email,
            "items": processed_items,
            "subtotal": calculated_subtotal,
            "delivery_charge": delivery_charge,
            "total_price": final_total,
            "status": "PENDING_PAYMENT",
            
            # Delivery Mapping
            "delivery_location": delivery_info.get('location'),
            "postal_code": str(delivery_info.get('postal_code')), 
            "delivery_instructions": delivery_info.get('delivery_instructions', 'None'),
            "contact_number": delivery_info.get('contact')
        }

        # 5. Save to DynamoDB
        table.put_item(Item=item)

        # 6. Trigger Step Function (Passing the full item so tasks have user_id/order_id)
        sfn.start_execution(
            stateMachineArn=os.environ['STATE_MACHINE_ARN'],
            input=json.dumps(item, cls=DecimalEncoder)
        )

        return {
            "statusCode": 201,
            "headers": headers,
            "body": json.dumps({
                "message": "Bulk order created",
                "orderId": order_id,
                "total": final_total
            }, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"Error Processing Order: {str(e)}")
        return {
            "statusCode": 500, 
            "headers": headers,
            "body": json.dumps({"error": "Internal Server Error", "details": str(e)})
        }