#!/usr/bin/env python3
import os
import aws_cdk as cdk
from ecommerce_order_processing.ecommerce_order_processing_stack import EcommerceOrderProcessingStack


app = cdk.App()

# 1. Get the 'stage' from the command line context (e.g., -c stage=test)
# If no stage is provided, it defaults to 'test' for safety.
stage = app.node.try_get_context("stage") or "test"

# 2. Define the Stack with a dynamic name
# This creates "test-PoultryStack" or "prod-PoultryStack"
EcommerceOrderProcessingStack(app, f"{stage}-PoultryStack",
    stage=stage, # Pass the stage string into your stack class
    env=cdk.Environment(account='199191591963', region='ap-southeast-1'),
)

app.synth()