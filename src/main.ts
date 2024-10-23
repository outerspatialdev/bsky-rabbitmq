import { BSKY_ENV } from "./config/bsky";
import { RABBIT_ENV } from "./config/rabbit";

import { Firehose, getOpsByType } from "./helpers/firehose";
import { LOGGER } from "./logger";

import { DidResolver, MemoryCache } from "@atproto/identity";
import amqp from "amqplib";
import { getRabbitUrl } from "./rabbit";

const connectUrl = getRabbitUrl();
LOGGER.debug(`Connecting to RabbitMQ at ${connectUrl}`);

const connection = await amqp.connect(connectUrl.toString());
const channel = await connection.createChannel();

const firehoseExchange = RABBIT_ENV.RABBIT_FIREHOSE_EXCHANGE;
await channel.assertExchange(firehoseExchange, "topic", { durable: false });

const didCache = new MemoryCache();
const didResolver = new DidResolver({
    plcUrl: "https://plc.directory",
    didCache,
});

let opCount = 0;

setInterval(() => {
    const opsPerSecond = opCount / 10;
    LOGGER.info(
        { opsPerSecond, opCount },
        `Processed ${opsPerSecond} ops/sec - ${opCount} total`,
    );
    opCount = 0;

    const requestedAt = new Date();
    setImmediate(() => {
        const processedAt = new Date();
        const diff = processedAt.getTime() - requestedAt.getTime();
        LOGGER.info({ diff }, `Processing time: ${diff}ms`);
    });
}, 10000);

const firehose = new Firehose({
    service: BSKY_ENV.BSKY_FIREHOSE_URL,
    handler: async (evt) => {
        const opsByType = await getOpsByType(evt);
        if (!opsByType) return;

        publishBatch(channel, "post.create", opsByType.posts.creates);
        publishBatch(channel, "post.delete", opsByType.posts.deletes);
        publishBatch(channel, "repost.create", opsByType.reposts.creates);
        publishBatch(channel, "repost.delete", opsByType.reposts.deletes);
        publishBatch(channel, "like.create", opsByType.likes.creates);
        publishBatch(channel, "like.delete", opsByType.likes.deletes);
        publishBatch(channel, "follow.create", opsByType.follows.creates);
        publishBatch(channel, "follow.delete", opsByType.follows.deletes);
    },
});

function publishBatch<T>(channel: amqp.Channel, routingKey: string, data: T[]) {
    opCount += data.length;
    for (const item of data) {
        channel.publish(
            firehoseExchange,
            routingKey,
            Buffer.from(JSON.stringify(item)),
        );
    }
}

firehose.run(5000);
LOGGER.info("Firehose running");
