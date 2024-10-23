import { RABBIT_ENV } from "./config/rabbit";

export function getRabbitUrl() {
    const user = encodeURIComponent(RABBIT_ENV.RABBIT_USER);
    const pass = encodeURIComponent(RABBIT_ENV.RABBIT_PASS);

    const url = new URL(`amqp://${RABBIT_ENV.RABBIT_HOST}`);
    url.port = RABBIT_ENV.RABBIT_PORT;
    url.pathname = RABBIT_ENV.RABBIT_VHOST;
    url.username = user;
    url.password = pass;

    return url;
}
