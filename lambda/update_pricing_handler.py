import json
import boto3
import os
import time
from decimal import Decimal

# Initialize AWS Clients
s3 = boto3.client('s3')
cf = boto3.client('cloudfront')
dynamodb = boto3.resource('dynamodb') # Added DynamoDB Resource

# Config from Environment Variables
BUCKET_NAME = os.environ.get('PRODUCTS_BUCKET_NAME')
DISTRIBUTION_ID = os.environ.get('CLOUDFRONT_DISTRIBUTION_ID')
TABLE_NAME = os.environ.get('PRODUCTS_TABLE_NAME')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
    'Content-Type': 'application/json'
}

def lambda_handler(event, context):
    """
    Handles daily price updates for The Block.
    Verifies Admin group membership, saves to S3, and clears CloudFront cache.
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        # 1. Identity & Role Verification
        authorizer = event.get('requestContext', {}).get('authorizer', {})
        claims = authorizer.get('claims', {})
        user_groups = claims.get('cognito:groups', "")
        
        if "Admins" not in user_groups:
            return {
                'statusCode': 403,
                'headers': CORS_HEADERS,
                'body': json.dumps({'message': 'Access Denied: Admin privileges required'})
            }

        # 2. Parse and Validate incoming data
        body = json.loads(event.get('body', '{}'))
        products = body.get('products')

        if not products or not isinstance(products, list):
            return { 'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'message': 'Invalid Payload'}) }

        # 3. SAVE TO DYNAMODB (The missing piece)
        table = dynamodb.Table(TABLE_NAME)
        
        # Use a batch writer for efficiency
        with table.batch_writer() as batch:
            for product in products:
                batch.put_item(
                    Item={
                        'id': str(product['id']),
                        'name': str(product['name']),
                        # DynamoDB requires Decimal for numbers, not Float
                        'price': Decimal(str(product['price'])), 
                        'unit': str(product['unit']),
                        'category': str(product.get('category', 'General')),
                        'image': str(product['image']),
                        'cuts': product.get('cuts', []),
                        'stock': product.get('stock', True),
                        'updatedAt': int(time.time())
                    }
                )
        print(f"Successfully synced {len(products)} items to DynamoDB table: {TABLE_NAME}")

        # 4. Save to S3
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key='data/products.json',
            Body=json.dumps(products),
            ContentType='application/json'
        )

        # 5. Invalidate CloudFront
        cf.create_invalidation(
            DistributionId=DISTRIBUTION_ID,
            InvalidationBatch={
                'Paths': {'Quantity': 1, 'Items': ['/data/products.json']},
                'CallerReference': f"update-{int(time.time())}"
            }
        )

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'message': 'Pricing updated and CDN cache invalidated.',
                'admin': claims.get('email'),
                'timestamp': context.aws_request_id
            })
        }

    except Exception as e:
        print(f"Critical Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'message': f'Server Error: {str(e)}'})
        }

