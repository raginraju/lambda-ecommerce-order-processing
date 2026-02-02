from aws_cdk import Stack, CfnOutput
from constructs import Construct
from ecommerce_order_processing.infrastructure.database import PoultryDatabase
from ecommerce_order_processing.infrastructure.auth import PoultryAuth
from ecommerce_order_processing.infrastructure.api import PoultryApi

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

        # 4. Final Stack Outputs (For Postman/Frontend)
        CfnOutput(self, "UserPoolId", 
                  value=auth.user_pool.user_pool_id)
        
        CfnOutput(self, "UserPoolClientId", 
                  value=auth.user_pool_client.user_pool_client_id)