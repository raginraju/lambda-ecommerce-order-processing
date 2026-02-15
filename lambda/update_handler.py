import boto3, os, json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def handler(event, context):
    # 1. Extract both keys required by your PoultryDatabase schema
    order_id = event.get("orderId")
    user_id = event.get("userId")
    status = event.get("status")

    if not order_id or not user_id:
        print(f"Error: Missing keys. user_id: {user_id}, order_id: {order_id}")
        raise Exception("Missing Partition Key (userId) or Sort Key (orderId)")

    # 2. Update the item using the Composite Key
    table.update_item(
        Key={
            "userId": user_id, 
            "orderId": order_id
        },
        UpdateExpression="SET #s = :val, updated_at = :time",
        ExpressionAttributeNames={
            "#s": "status"
        },
        ExpressionAttributeValues={
            ":val": status,
            ":time": json.dumps(context.aws_request_id) # Optional: track update history
        }
    )

    # 3. Return the full state so the SNS 'NotifyCustomer' task has all the info
    return {
        "orderId": order_id, 
        "userId": user_id, 
        "status": status
    }