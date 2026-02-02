#!/usr/bin/env python3
import aws_cdk as cdk
from ecommerce_order_processing.ecommerce_order_processing_stack import PoultryInfraStack, PoultryDeployStack

app = cdk.App()
stage = app.node.try_get_context("stage") or "test"
env = cdk.Environment(account='199191591963', region='ap-southeast-1')

# 1. Deploy Infrastructure
infra = PoultryInfraStack(app, f"{stage}-PoultryInfraStack", stage=stage, env=env)

# 2. Deploy Frontend (Only when requested)
PoultryDeployStack(app, f"{stage}-PoultryDeployStack", infra_stack=infra, env=env)

app.synth()