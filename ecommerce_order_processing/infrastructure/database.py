from aws_cdk import aws_dynamodb as dynamodb, RemovalPolicy
from constructs import Construct

class PoultryDatabase(Construct):
    def __init__(self, scope: Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)
        
        # This 'self.' is key - it makes the table accessible outside this file
        self.orders_table = dynamodb.Table(
            self, "OrdersTable",
            partition_key=dynamodb.Attribute(name="userId", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="orderId", type=dynamodb.AttributeType.STRING),
            removal_policy=RemovalPolicy.DESTROY
        )