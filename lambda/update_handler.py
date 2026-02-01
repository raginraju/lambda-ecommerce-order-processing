import boto3, os, json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def handler(event, context):
    order_id = event["orderId"]
    status = event["status"]

    table.update_item(
        Key={"orderId": order_id},
        UpdateExpression="SET #s = :val",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":val": status}
    )

    return {"orderId": order_id, "status": status}