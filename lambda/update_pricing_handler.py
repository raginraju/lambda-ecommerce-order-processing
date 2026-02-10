import json
import boto3
import os
import time

# Initialize AWS Clients
s3 = boto3.client('s3')
cf = boto3.client('cloudfront')

# Config from Environment Variables
BUCKET_NAME = os.environ.get('PRODUCTS_BUCKET_NAME')
DISTRIBUTION_ID = os.environ.get('CLOUDFRONT_DISTRIBUTION_ID')

def lambda_handler(event, context):
    """
    Handles daily price updates for The Block.
    Verifies Admin group membership, saves to S3, and clears CloudFront cache.
    """
    try:
        # 1. Identity & Role Verification (via Cognito Groups)
        authorizer = event.get('requestContext', {}).get('authorizer', {})
        claims = authorizer.get('claims', {})
        
        # Cognito groups can come as a string or a list in the claims
        user_groups = claims.get('cognito:groups', "")
        
        # Security Gate: Check if the user is part of the 'Admins' group
        if "Admins" not in user_groups:
            authenticated_email = claims.get('email', 'Unknown User')
            print(f"SECURITY ALERT: Unauthorized update attempt by {authenticated_email}")
            return {
                'statusCode': 403,
                'headers': get_cors_headers(),
                'body': json.dumps({'message': 'Access Denied: Admin privileges required'})
            }

        # 2. Parse and Validate incoming data
        body = json.loads(event.get('body', '{}'))
        products = body.get('products')

        if not products or not isinstance(products, list):
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({'message': 'Invalid Payload format: Expected list of products'})
            }

        # 3. Publish to S3 with 24-hour Cache Headers
        # Note: We use data/products.json to match your CloudFront behavior
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key='data/products.json',
            Body=json.dumps(products),
            ContentType='application/json',
            CacheControl='max-age=86400, public'
        )

        # 4. Invalidate CloudFront Cache
        # This forces the Singapore Edge locations to dump the old JSON
        cf.create_invalidation(
            DistributionId=DISTRIBUTION_ID,
            InvalidationBatch={
                'Paths': {
                    'Quantity': 1,
                    'Items': ['/data/products.json']
                },
                'CallerReference': f"update-{int(time.time())}" # Unique ID for the request
            }
        )

        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
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
            'headers': get_cors_headers(),
            'body': json.dumps({'message': 'Internal Server Error'})
        }

def get_cors_headers():
    # In production, replace '*' with your specific CloudFront URL
    return {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Content-Type': 'application/json'
    }