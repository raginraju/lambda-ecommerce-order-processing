from aws_cdk import aws_dynamodb as dynamodb, RemovalPolicy
from constructs import Construct

class PoultryDatabase(Construct):
    def __init__(self, scope: Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)
        
        # 1. Orders Table
        self.orders_table = dynamodb.Table(
            self, "OrdersTable",
            partition_key=dynamodb.Attribute(name="userId", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="orderId", type=dynamodb.AttributeType.STRING),
            removal_policy=RemovalPolicy.DESTROY,
            # Enabling point-in-time recovery is good practice for orders
            point_in_time_recovery=True 
        )

        # 2. Products Table (The "Master Record" for prices)
        self.products_table = dynamodb.Table(
            self, "ProductsTable",
            # We use 'id' as the PK to match your frontend/JSON structure
            partition_key=dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING),
            removal_policy=RemovalPolicy.DESTROY,
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST
        )