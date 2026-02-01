import random

def handler(event, context):
    # Simulated payment
    if random.choice([True, False]):
        return {"status": "SUCCESS", "orderId": event["orderId"]}
    else:
        return {"status": "FAILED", "orderId": event["orderId"]}