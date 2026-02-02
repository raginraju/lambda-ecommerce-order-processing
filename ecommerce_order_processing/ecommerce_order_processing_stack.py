from aws_cdk import (
    Stack, 
    CfnOutput, 
    RemovalPolicy,
    aws_s3 as s3,
    aws_s3_deployment as s3deploy,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins
)
from constructs import Construct
from ecommerce_order_processing.infrastructure.database import PoultryDatabase
from ecommerce_order_processing.infrastructure.auth import PoultryAuth
from ecommerce_order_processing.infrastructure.api import PoultryApi
import os
class EcommerceOrderProcessingStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # 1. Database Block (Storage)
        # This creates the Orders DynamoDB table
        db = PoultryDatabase(self, "PoultryData")

        # 2. Auth Block (Identity)
        # This creates Cognito User Pool, Client, and API Authorizer
        auth = PoultryAuth(self, "PoultryAuth")

        # 3. API & Logic Block (Compute & Workflow)
        # We pass the table and authorizer as arguments so this block can use them
        api = PoultryApi(self, "PoultryApi", 
            orders_table=db.orders_table, 
            authorizer=auth.authorizer
        )

        # --- FRONTEND DEPLOYMENT BLOCK ---

        # 4. Create a PRIVATE S3 Bucket (More Secure)
        site_bucket = s3.Bucket(self, "PoultryUIBucket",
            # Remove public_read_access=True
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL, 
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True
        )

        # 7. The Distribution handles the "Website" logic
        distribution = cloudfront.Distribution(self, "PoultrySiteDistribution",
            default_root_object="index.html", # Handles the home page
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(site_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            ),
            # Handles React Router refreshes
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html"
                ),
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html"
                )
            ]
        )
        
        # 6. Deploy your React build folder to S3 automatically (Now with Invalidation)
        s3deploy.BucketDeployment(self, "DeployPoultryUI",
            sources=[s3deploy.Source.asset("./frontend/dist")], 
            destination_bucket=site_bucket,
            distribution=distribution,          # Tells CloudFront about the update
            distribution_paths=["/*"]            # Clears the cache immediately
        )

        # --- OUTPUTS ---

        # Auth Outputs
        CfnOutput(self, "UserPoolId", 
                  value=auth.user_pool.user_pool_id)
        
        CfnOutput(self, "UserPoolClientId", 
                  value=auth.user_pool_client.user_pool_client_id)

        # Website URL Output
        # CfnOutput(self, "WebsiteURL",
        #           value=site_bucket.bucket_website_url,
        #           description="The URL of your poultry shop")
        
        # 2. Update the Output to show the SECURE URL
        CfnOutput(self, "SecureShopURL",
            value=f"https://{distribution.distribution_domain_name}",
            description="The HTTPS URL of your Poultry meat shop"
        )
        
        # This generates a small helper script to update your .env
        with open("update_env.sh", "w") as f:
            f.write(f"echo VITE_COGNITO_USER_POOL_ID={auth.user_pool.user_pool_id} > frontend/.env\n")
            f.write(f"echo VITE_COGNITO_CLIENT_ID={auth.user_pool_client.user_pool_client_id} >> frontend/.env\n")
            f.write(f"echo VITE_API_URL={api.api_gateway.url} >> frontend/.env\n")
