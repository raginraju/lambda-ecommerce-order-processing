#!/usr/bin/env python3
import os

import aws_cdk as cdk

from ecommerce_order_processing.ecommerce_order_processing_stack import EcommerceOrderProcessingStack


app = cdk.App()
EcommerceOrderProcessingStack(app, "EcommerceOrderProcessingStack",
    env=cdk.Environment(account='199191591963', region='ap-southeast-1'),
    )

app.synth()
