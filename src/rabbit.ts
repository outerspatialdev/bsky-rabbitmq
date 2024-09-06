import { ENV } from "./config";

export function getRabbitUrl() {
    const connectUrl = new URL(`amqp://${ENV.RABBIT_HOST}`);
    connectUrl.port = ENV.RABBIT_PORT.toString();
    connectUrl.pathname = ENV.RABBIT_VHOST;
    connectUrl.username = ENV.RABBIT_USER;
    connectUrl.password = ENV.RABBIT_PASS;

    return connectUrl.toString();
}
