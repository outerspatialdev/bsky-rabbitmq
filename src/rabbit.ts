import { ENV } from "./config";

export function getRabbitUrl() {
    const user = encodeURIComponent(ENV.RABBIT_USER);
    const pass = encodeURIComponent(ENV.RABBIT_PASS);

    const url = new URL(`amqp://${ENV.RABBIT_HOST}`);
    url.port = ENV.RABBIT_PORT.toString();
    url.pathname = ENV.RABBIT_VHOST;
    url.username = user;
    url.password = pass;

    return url;
}
