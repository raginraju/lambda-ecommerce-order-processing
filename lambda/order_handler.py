# lambda/order_handler.py
import json, uuid, boto3, os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])
sfn = boto3.client('stepfunctions')

def handler(event, context):
    
    print(f"Received event: {json.dumps(event)}") # Log the incoming request
    body = json.loads(event['body'])
    order_id = str(uuid.uuid4())
    
    print(f"Processing Order ID: {order_id}") # Log the specific order
    
    item = {
        "orderId": order_id,
        "product": body['product'],
        "amount": body['amount'],
        "status": "PENDING"
    }
    table.put_item(Item=item)
    
    print("Successfully wrote to DynamoDB")

    sfn.start_execution(
        stateMachineArn=os.environ['STATE_MACHINE_ARN'],
        input=json.dumps(item)
    )
    
    print("Step Function execution started")

    return {
        "statusCode": 200,
        "body": json.dumps({"orderId": order_id, "status": "PROCESSING"})
    }