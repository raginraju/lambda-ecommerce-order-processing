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

        self.db = PoultryDatabase(self, f"{stage}-PoultryData")
        self.auth = PoultryAuth(self, f"{stage}-PoultryAuth")
        self.api = PoultryApi(self, f"{stage}-PoultryApi", 
            orders_table=self.db.orders_table, 
            authorizer=self.auth.authorizer
        )

        # Create the bucket once, but don't deploy to it yet
        self.site_bucket = s3.Bucket(self, "PoultryUIBucket",
            bucket_name=f"{stage}-poultry-shop-{self.account}",
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL, 
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True
        )

        self.distribution = cloudfront.Distribution(self, "PoultrySiteDistribution",
            default_root_object="index.html",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(self.site_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            )
        )

        # Outputs for the Frontend Build
        CfnOutput(self, "ApiUrl", value=self.api.api_gateway.url)
        CfnOutput(self, "UserPoolId", value=self.auth.user_pool.user_pool_id)
        CfnOutput(self, "UserPoolClientId", value=self.auth.user_pool_client.user_pool_client_id)

# --- STACK 2: DEPLOYMENT (The "Fast" stuff) ---
class PoultryDeployStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, infra_stack: PoultryInfraStack, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        s3deploy.BucketDeployment(self, "DeployPoultryUI",
            sources=[s3deploy.Source.asset("./frontend/dist")], 
            destination_bucket=infra_stack.site_bucket,
            distribution=infra_stack.distribution,
            distribution_paths=["/*"]
        )