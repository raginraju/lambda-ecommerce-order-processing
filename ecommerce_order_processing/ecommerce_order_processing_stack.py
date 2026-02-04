from aws_cdk import (
    Stack, CfnOutput, RemovalPolicy,
    aws_s3 as s3,
    aws_s3_deployment as s3deploy,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins
)
from constructs import Construct
from ecommerce_order_processing.infrastructure.database import PoultryDatabase
from ecommerce_order_processing.infrastructure.auth import PoultryAuth
from ecommerce_order_processing.infrastructure.api import PoultryApi

# --- STACK 1: INFRASTRUCTURE (The "Heavy" stuff) ---
class PoultryInfraStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, stage: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Core Services
        self.db = PoultryDatabase(self, f"{stage}-PoultryData")
        self.auth = PoultryAuth(self, f"{stage}-PoultryAuth")
        self.api = PoultryApi(self, f"{stage}-PoultryApi", 
            orders_table=self.db.orders_table, 
            authorizer=self.auth.authorizer
        )

        # 1. BUCKET FOR UI (HTML/JS/CSS)
        self.site_bucket = s3.Bucket(self, "PoultryUIBucket",
            bucket_name=f"{stage}-poultry-shop-ui-{self.account}",
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL, 
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True
        )

        # 2. BUCKET FOR PRODUCT IMAGES (Optimized Storage)
        self.images_bucket = s3.Bucket(self, "PoultryImagesBucket",
            bucket_name=f"{stage}-poultry-shop-images-{self.account}",
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True
        )

        # 3. SINGLE CLOUDFRONT DISTRIBUTION (The "Shield")
        self.distribution = cloudfront.Distribution(self, "PoultryCombinedDist",
            default_root_object="index.html",
            # Force CloudFront to serve index.html on 404/403 errors so React Router can handle client-side deep links.
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
            ],
            # DEFAULT BEHAVIOR: Serves the Frontend UI
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(self.site_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cache_policy=cloudfront.CachePolicy.CACHING_OPTIMIZED
            )
        )

        # 4. ADD ADDITIONAL BEHAVIOR: For Images
        # Any request to /images/* will go to the Images Bucket
        self.distribution.add_behavior(
            path_pattern="/images/*",
            origin=origins.S3BucketOrigin.with_origin_access_control(self.images_bucket),
            viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            # This is the cost-optimizer: Aggressive caching for images
            cache_policy=cloudfront.CachePolicy.CACHING_OPTIMIZED
        )

        # Outputs for the GitHub Actions / Frontend Build
        CfnOutput(self, "ApiUrl", value=self.api.api_gateway.url)
        CfnOutput(self, "UserPoolId", value=self.auth.user_pool.user_pool_id)
        CfnOutput(self, "UserPoolClientId", value=self.auth.user_pool_client.user_pool_client_id)
        CfnOutput(self, "CloudFrontURL", value=self.distribution.distribution_domain_name)
        CfnOutput(self, "ImagesBucketName", value=self.images_bucket.bucket_name)

# --- STACK 2: DEPLOYMENT (The "Fast" stuff) ---
class PoultryDeployStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, infra_stack: PoultryInfraStack, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Deploys the React Website to the UI Bucket
        s3deploy.BucketDeployment(self, "DeployPoultryUI",
            sources=[s3deploy.Source.asset("./frontend/dist")], 
            destination_bucket=infra_stack.site_bucket,
            distribution=infra_stack.distribution,
            distribution_paths=["/*"]
        )