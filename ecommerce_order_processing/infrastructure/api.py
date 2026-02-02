from aws_cdk import (
    Duration,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    aws_sns as sns,
    aws_sns_subscriptions as subs,
    aws_stepfunctions as sfn,
    aws_stepfunctions_tasks as tasks,
    CfnOutput
)
from constructs import Construct

class PoultryApi(Construct):
    def __init__(self, scope: Construct, id: str, orders_table, authorizer, **kwargs):
        super().__init__(scope, id, **kwargs)

        # 1. Messaging (SNS)
        self.notification_topic = sns.Topic(self, "OrderNotifications")
        self.notification_topic.add_subscription(
            subs.EmailSubscription("raginraju1@gmail.com")
        )

        # 2. Workflow Tasks (Lambdas)
        payment_lambda = _lambda.Function(
            self, "PaymentLambda",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="payment_handler.handler",
            code=_lambda.Code.from_asset("lambda")
        )

        update_lambda = _lambda.Function(
            self, "UpdateOrderStatusLambda",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="update_handler.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={"TABLE_NAME": orders_table.table_name}
        )
        orders_table.grant_write_data(update_lambda)

        # 3. Step Functions Workflow
        payment_task = tasks.LambdaInvoke(
            self, "ChargeCustomer",
            lambda_function=payment_lambda,
            output_path="$.Payload"
        ).add_retry(max_attempts=3, interval=Duration.seconds(5))

        update_status_task = tasks.LambdaInvoke(
            self, "UpdateOrderStatus",
            lambda_function=update_lambda,
            output_path="$.Payload"
        )

        notify_task = tasks.SnsPublish(
            self, "NotifyCustomer",
            topic=self.notification_topic,
            message=sfn.TaskInput.from_json_path_at("$.status")
        )

        state_machine = sfn.StateMachine(
            self, "OrderStateMachine",
            definition_body=sfn.DefinitionBody.from_chainable(
                payment_task.next(update_status_task).next(notify_task)
            )
        )

        # 4. Main API Lambdas
        self.order_lambda = _lambda.Function(
            self, "OrderLambda",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="order_handler.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "TABLE_NAME": orders_table.table_name,
                "STATE_MACHINE_ARN": state_machine.state_machine_arn
            }
        )
        orders_table.grant_write_data(self.order_lambda)
        state_machine.grant_start_execution(self.order_lambda)

        self.list_orders_lambda = _lambda.Function(
            self, "ListOrdersLambda",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="list_orders_handler.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={"TABLE_NAME": orders_table.table_name}
        )
        orders_table.grant_read_data(self.list_orders_lambda)

        # 5. API Gateway
        self.api_gateway = apigateway.LambdaRestApi(
            self, "OrderApi",
            handler=self.order_lambda,
            proxy=False,
            default_cors_preflight_options=apigateway.CorsOptions(
                allow_origins=["*"], 
                allow_methods=["GET", "POST", "OPTIONS"]
            )
        )
        
        orders_resource = self.api_gateway.root.add_resource("orders")
        
        orders_resource.add_method("POST", 
            authorizer=authorizer,
            authorization_type=apigateway.AuthorizationType.COGNITO
        )
        
        orders_resource.add_method("GET", 
            apigateway.LambdaIntegration(self.list_orders_lambda),
            authorizer=authorizer,
            authorization_type=apigateway.AuthorizationType.COGNITO
        )