import aws_cdk as core
import aws_cdk.assertions as assertions

from ecommerce_order_processing.ecommerce_order_processing_stack import EcommerceOrderProcessingStack

# example tests. To run these tests, uncomment this file along with the example
# resource in ecommerce_order_processing/ecommerce_order_processing_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = EcommerceOrderProcessingStack(app, "ecommerce-order-processing")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
