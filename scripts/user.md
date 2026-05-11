# Timer Table Script:

## Create DyammodDB table for Timer locally

```sh
aws dynamodb create-table \
 --table-name timers \
 --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \
 --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
 --billing-mode PAY_PER_REQUEST \
 --endpoint-url http://127.0.0.1:8000
```

## List existing tables

```sh
aws dynamodb list-tables --endpoint-url http://127.0.0.1:8000
```
