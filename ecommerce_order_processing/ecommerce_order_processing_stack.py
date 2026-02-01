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
    aws_cognito as cognito, 
    RemovalPolicy,
    CfnOutput
)
from constructs import Construct


class EcommerceOrderProcessingStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        auto_confirm_lambda = _lambda.Function(
            self, "AutoConfirmLambda",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="index.handler",
            code=_lambda.Code.from_inline("""
def handler(event, context):
    # This must be flush against the left wall
    event['response']['autoConfirmUser'] = True
    event['response']['autoVerifyEmail'] = True
    return event
""")
        )

        user_pool = cognito.UserPool(self, "EcommerceUserPool",
            user_pool_name="EcommerceCustomerPool",
            self_sign_up_enabled=True,
            # This is the "Email Only" magic
            sign_in_aliases=cognito.SignInAliases(email=True),
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            
            
            # --- Skip confirmation ---
            lambda_triggers=cognito.UserPoolTriggers(
                pre_sign_up=auto_confirm_lambda
            ),
            # ---------------------------
            
            # Optional: Customize the password strength
            password_policy=cognito.PasswordPolicy(
                min_length=8,
                require_digits=True,
                require_uppercase=True,
                require_symbols=True
            ),
            # Ensure the email attribute is required and cannot be changed later
            standard_attributes=cognito.StandardAttributes(
                email=cognito.StandardAttribute(required=True, mutable=False)
            ),
            # DANGER: For development only. This deletes the user pool when you run 'cdk destroy'
            removal_policy=RemovalPolicy.DESTROY 
        )
        
        # Create a Client so your app can interact with this pool
        user_pool_client = user_pool.add_client("EcommerceAppClient",
            auth_flows=cognito.AuthFlow(
                user_password=True  # Allows login with email and password
            )
        )
        
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
            handler="order_handler.handler",           # File name . Function name
            code=_lambda.Code.from_asset("lambda")     # Path to the folder
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
            handler="payment_handler.handler",           # File name . Function name
            code=_lambda.Code.from_asset("lambda")     # Path to the folder
        )

        # Lambda: Update Order Status
        update_lambda = _lambda.Function(
            self, "UpdateOrderStatusLambda",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="update_handler.handler",           # File name . Function name
            code=_lambda.Code.from_asset("lambda")     # Path to the folder
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
        CfnOutput(self, "UserPoolId", value=user_pool.user_pool_id)
        CfnOutput(self, "UserPoolClientId", value=user_pool_client.user_pool_client_id)
