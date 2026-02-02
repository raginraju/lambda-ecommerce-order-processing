import json, uuid, boto3, os
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])
sfn = boto3.client('stepfunctions')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

VALID_CUTS = [
    "WHOLE_CHICKEN", "HALF_CHICKEN", "CURRY_CUT", "BIRYANI_CUT", 
    "SOUP_BONES", "BREAST_FILLET", "THIGH_FILLET", "TENDERS", 
    "DRUMSTICKS", "WHOLE_LEGS", "WINGS_FULL", "WINGS_DRUMETTE", 
    "WINGS_WINGETTE", "LOLLIPOPS"
]

def handler(event, context):
    try:
        user_id = event['requestContext']['authorizer']['claims']['sub']
        user_email = event['requestContext']['authorizer']['claims']['email']
        body = json.loads(event['body'])
        
        # 1. Extract Numbers for Calculation
        weight = Decimal(str(body.get('weight', 0)))
        price_per_kg = Decimal(str(body.get('price_per_kg', 0)))
        delivery_charge = Decimal(str(body.get('delivery_charge', 0))) # New Field
        quantity = int(body.get('quantity', 1))

        # 2. Calculate Subtotal and Final Total
        subtotal = weight * price_per_kg * quantity
        total_price = subtotal + delivery_charge

        order_id = str(uuid.uuid4())
        order_at = datetime.now().isoformat() 

        # 3. Build the Item
        item = {
            "userId": user_id,
            "orderId": order_id,
            "order_at": order_at,
            # "email": user_email,
            # "product_name": "Broiler Chicken",
            "cut_type": body.get('cut_type'),
            "weight_kg": weight,
            "price_per_kg": price_per_kg,
            "delivery_charge": delivery_charge,
            "total_price": total_price,
            "quantity": quantity,
            "status": "PENDING_PAYMENT",
            
            # Location
            "delivery_address": body.get('location'),
            "postal_code": str(body.get('postal_code')), 
            "delivery_instructions": body.get('delivery_instructions', 'None')
        }

        # 4. Save to DynamoDB
        table.put_item(Item=item)

        # 5. Trigger Step Function
        sfn.start_execution(
            stateMachineArn=os.environ['STATE_MACHINE_ARN'],
            input=json.dumps(item, cls=DecimalEncoder)
        )

        return {
            "statusCode": 201,
            "body": json.dumps({
                "message": "Order created with delivery",
                "orderId": order_id,
                "subtotal": subtotal,
                "delivery": delivery_charge,
                "total": total_price
            }, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": "Internal error"})}