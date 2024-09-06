# bsky-rabbitmq

Publishes Bsky firehose to rabbitmq

## Running Locally

- Requires Node 20

```sh
npm install
npm start
```

## Environment Variables

| Variable | Description | Default |
| -------- | ----------- | ------- |
| `RABBIT_USER` | RabbitMQ user | |
| `RABBIT_PASS` | RabbitMQ password | |
| `RABBIT_HOST` | RabbitMQ host | `localhost` |
| `RABBIT_PORT` | RabbitMQ port | `5672` |
| `RABBIT_VHOST` | RabbitMQ vhost | `/` |
| `RABBIT_FIREHOSE_EXCHANGE` | RabbitMQ firehose exchange | `firehose` |

