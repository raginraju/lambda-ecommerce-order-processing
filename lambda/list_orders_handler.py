import json, boto3, os
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,GET"
}

def handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # 1. Check for Query Parameters (?status=PENDING_PAYMENT)
        query_params = event.get('queryStringParameters') or {}
        requested_status = query_params.get('status')

        # 2. Base Query Arguments
        query_args = {
            'KeyConditionExpression': Key('userId').eq(user_id),
            'ScanIndexForward': False  # This sorts newest orders to the top
        }

        # 3. Add Status Filter if requested
        if requested_status:
            query_args['FilterExpression'] = Attr('status').eq(requested_status)

        # 4. Execute Query
        response = table.query(**query_args)

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({
                "count": response['Count'],
                "orders": response['Items']
            }, cls=DecimalEncoder)
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"statusCode": 500, "headers": CORS_HEADERS, "body": json.dumps({"error": "Failed to list orders"})}