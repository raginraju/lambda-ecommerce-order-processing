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

class EcommerceOrderProcessingStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, stage: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # 1. Database Block
        # We pass the stage to our sub-constructs if they need to name tables uniquely
        db = PoultryDatabase(self, f"{stage}-PoultryData")

        # 2. Auth Block
        auth = PoultryAuth(self, f"{stage}-PoultryAuth")

        # 3. API & Logic Block
        api = PoultryApi(self, f"{stage}-PoultryApi", 
            orders_table=db.orders_table, 
            authorizer=auth.authorizer
        )

        # --- FRONTEND DEPLOYMENT BLOCK ---

        # 4. Create a PRIVATE S3 Bucket with a Stage-specific name
        # S3 bucket names must be globally unique
        site_bucket = s3.Bucket(self, "PoultryUIBucket",
            bucket_name=f"{stage}-poultry-shop-{self.account}",
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL, 
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True
        )

        # 5. CloudFront Distribution
        distribution = cloudfront.Distribution(self, "PoultrySiteDistribution",
            comment=f"CloudFront Distribution for {stage} environment",
            default_root_object="index.html",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(site_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            ),
            error_responses=[
                cloudfront.ErrorResponse(http_status=403, response_http_status=200, response_page_path="/index.html"),
                cloudfront.ErrorResponse(http_status=404, response_http_status=200, response_page_path="/index.html")
            ]
        )
        
        # 6. Deploy files to S3
        s3deploy.BucketDeployment(self, "DeployPoultryUI",
            sources=[s3deploy.Source.asset("./frontend/dist")], 
            destination_bucket=site_bucket,
            distribution=distribution,
            distribution_paths=["/*"]
        )

        # --- OUTPUTS ---
        CfnOutput(self, "UserPoolId", value=auth.user_pool.user_pool_id)
        CfnOutput(self, "UserPoolClientId", value=auth.user_pool_client.user_pool_client_id)
        CfnOutput(self, "ApiUrl", value=api.api_gateway.url) # renamed for easier jq access
        
        CfnOutput(self, "SecureShopURL",
            value=f"https://{distribution.distribution_domain_name}",
            description=f"The HTTPS URL of the {stage} Poultry shop"
        )
