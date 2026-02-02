from aws_cdk import (
    aws_cognito as cognito,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    RemovalPolicy
)
from constructs import Construct

class PoultryAuth(Construct):
    def __init__(self, scope: Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        # 1. Trigger for auto-confirming users
        self.auto_confirm_lambda = _lambda.Function(
            self, "AutoConfirmLambda",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="index.handler",
            code=_lambda.Code.from_inline(
                "def handler(event, context):\n"
                "    event['response']['autoConfirmUser'] = True\n"
                "    event['response']['autoVerifyEmail'] = True\n"
                "    return event"
            )
        )

        # 2. Main User Pool
        self.user_pool = cognito.UserPool(
            self, "EcommerceUserPool",
            user_pool_name="EcommerceCustomerPool",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(email=True),
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            lambda_triggers=cognito.UserPoolTriggers(
                pre_sign_up=self.auto_confirm_lambda
            ),
            password_policy=cognito.PasswordPolicy(
                # min_length=6,
                require_digits=False,
                require_uppercase=False,
                require_symbols=False
            ),
            standard_attributes=cognito.StandardAttributes(
                email=cognito.StandardAttribute(required=True, mutable=False)
            ),
            removal_policy=RemovalPolicy.DESTROY 
        )

        # 3. Client for the App
        self.user_pool_client = self.user_pool.add_client(
            "EcommerceAppClient",
            auth_flows=cognito.AuthFlow(user_password=True)
        )

        # 4. Authorizer for API Gateway
        self.authorizer = apigateway.CognitoUserPoolsAuthorizer(
            self, "EcommerceAuthorizer",
            cognito_user_pools=[self.user_pool]
        )