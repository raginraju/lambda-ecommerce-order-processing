from aws_cdk import (
    Stack,
    Duration,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    aws_dynamodb as dynamodb,
    aws_sns as sns,
    aws_sns_subscriptions as subs,
    aws_stepfunctions as sfn,
    aws_stepfunctions_tasks as tasks,
)
from constructs import Construct


class EcommerceOrderProcessingStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # DynamoDB Orders Table
        orders_table = dynamodb.Table(
            self, "OrdersTable",
            partition_key=dynamodb.Attribute(
                name="orderId", type=dynamodb.AttributeType.STRING
            )
        )

        # SNS Topic for Notifications
        notification_topic = sns.Topic(self, "OrderNotifications")
        notification_topic.add_subscription(
            subs.EmailSubscription("raginraju1@gmail.com")
        )

        # Lambda: Create Order
        order_lambda = _lambda.Function(
            self, "OrderLambda",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="index.handler",
            code=_lambda.Code.from_inline(
                """
import json, uuid, boto3, os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])
sfn = boto3.client('stepfunctions')

def handler(event, context):
    body = json.loads(event['body'])
    order_id = str(uuid.uuid4())
    item = {
        "orderId": order_id,
        "product": body['product'],
        "amount": body['amount'],
        "status": "PENDING"
    }
    table.put_item(Item=item)

    # Trigger Step Functions
    sfn.start_execution(
        stateMachineArn=os.environ['STATE_MACHINE_ARN'],
        input=json.dumps(item)
    )

    return {
        "statusCode": 200,
        "body": json.dumps({"orderId": order_id, "status": "PROCESSING"})
    }
                """
            )
        )
        orders_table.grant_write_data(order_lambda)

        # API Gateway: /orders endpoint
        api = apigateway.LambdaRestApi(
            self, "OrderApi",
            handler=order_lambda,
            proxy=False
        )
        orders = api.root.add_resource("orders")
        orders.add_method("POST")  # POST /orders

        # Lambda: Payment Processing
        payment_lambda = _lambda.Function(
            self, "PaymentLambda",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="index.handler",
            code=_lambda.Code.from_inline(
                """
import random

def handler(event, context):
    # Simulated payment
    if random.choice([True, False]):
        return {"status": "SUCCESS", "orderId": event["orderId"]}
    else:
        return {"status": "FAILED", "orderId": event["orderId"]}
                """
            )
        )

        # Lambda: Update Order Status
        update_lambda = _lambda.Function(
            self, "UpdateOrderStatusLambda",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="index.handler",
            code=_lambda.Code.from_inline(
                """
import boto3, os, json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def handler(event, context):
    order_id = event["orderId"]
    status = event["status"]

    table.update_item(
        Key={"orderId": order_id},
        UpdateExpression="SET #s = :val",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":val": status}
    )

    return {"orderId": order_id, "status": status}
                """
            )
        )
        orders_table.grant_write_data(update_lambda)
        update_lambda.add_environment("TABLE_NAME", orders_table.table_name)

        # Step Functions Workflow
        payment_task = tasks.LambdaInvoke(
            self, "ChargeCustomer",
            lambda_function=payment_lambda,
            output_path="$.Payload"
        )

        update_status_task = tasks.LambdaInvoke(
            self, "UpdateOrderStatus",
            lambda_function=update_lambda,
            output_path="$.Payload"
        )

        notify_task = tasks.SnsPublish(
            self, "NotifyCustomer",
            topic=notification_topic,
            message=sfn.TaskInput.from_json_path_at("$.status")
        )

        definition = payment_task.add_retry(
            max_attempts=3,
            interval=Duration.seconds(5)
        ).next(update_status_task).next(notify_task)

        state_machine = sfn.StateMachine(
            self, "OrderStateMachine",
            definition_body=sfn.DefinitionBody.from_chainable(definition)
        )

        # Give Order Lambda permissions to start workflow
        order_lambda.add_environment("TABLE_NAME", orders_table.table_name)
        order_lambda.add_environment("STATE_MACHINE_ARN", state_machine.state_machine_arn)
        state_machine.grant_start_execution(order_lambda)
