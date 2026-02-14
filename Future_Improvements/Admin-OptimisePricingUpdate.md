# "The Block" Infrastructure Scaling Plan

## 1. Goal
Reduce Admin UI 'Publish' latency from ~1.5s to <300ms by decoupling CloudFront invalidations from the main sync flow.

## 2. Current Architecture (Sequential)
1. Admin Click -> `UpdatePricingLambda` (128MB).
2. Sync to DynamoDB (Wait).
3. Sync to S3 `products.json` (Wait).
4. **CloudFront Invalidation (Wait ~1s)**.
5. Total: ~1.5s - 2.0s.

## 3. Future Architecture (Event-Driven)
### Step A: Update `UpdatePricingLambda`
Remove the CloudFront `create_invalidation` code. The Lambda now only writes to DynamoDB and S3 before returning.

### Step B: Background Invalidator (New Lambda)
Create a tiny `CloudFrontInvalidatorLambda` that runs on Python 3.11.

```python
import boto3
import os

cf = boto3.client('cloudfront')
DISTRIBUTION_ID = os.environ['CLOUDFRONT_DISTRIBUTION_ID']

def handler(event, context):
    # This runs only when S3 detects products.json has changed
    cf.create_invalidation(
        DistributionId=DISTRIBUTION_ID,
        InvalidationBatch={
            'Paths': {'Quantity': 1, 'Items': ['/data/products.json']},
            'CallerReference': str(context.aws_request_id)
        }
    )
    print("Background Invalidation Triggered")
```

### 4. Expected Impact
Admin UI Latency: Reduced by ~80%.
Cost: Slightly lower total Billed Duration across both Lambdas.
Reliability: CloudFront invalidation will happen even if the original request times out.