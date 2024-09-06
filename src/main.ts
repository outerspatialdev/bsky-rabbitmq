import { ENV } from "./config";
import { Firehose, getOpsByType } from "./helpers/firehose";
import { LOGGER } from "./logger";

import amqp from "amqplib";
import { getRabbitUrl } from "./rabbit";
import { PostCreatedSchema, type PostCreated } from "./bsky/post";
import { DidResolver, MemoryCache } from "@atproto/identity";

const connectUrl = getRabbitUrl();
LOGGER.debug(`Connecting to RabbitMQ at ${connectUrl}`);

const connection = await amqp.connect(connectUrl.toString());
const channel = await connection.createChannel();

const firehoseExchange = ENV.RABBIT_FIREHOSE_EXCHANGE;
await channel.assertExchange(firehoseExchange, "topic", { durable: false });

const didCache = new MemoryCache();
const didResolver = new DidResolver({
    plcUrl: "https://plc.directory",
    didCache,
});

const firehose = new Firehose({
    service: ENV.BSKY_FIREHOSE_URL,
    handler: async (evt) => {
        const opsByType = await getOpsByType(evt);
        if (!opsByType) return;

        for (const op of opsByType.posts.creates) {
            const data = {
                uri: op.uri,
                text: op.record.text,
                author: op.author,
                createdAt: op.record.createdAt,
                langs: op.record.langs ?? [],
            } satisfies PostCreated;
            channel.publish(
                firehoseExchange,
                "post.create",
                Buffer.from(JSON.stringify(data)),
            );
        }
        for (const op of opsByType.posts.deletes) {
            const data = {
                uri: op.uri,
            };

            channel.publish(
                firehoseExchange,
                "post.delete",
                Buffer.from(JSON.stringify(data)),
            );
        }

        for (const op of opsByType.reposts.creates) {
            const data = {
                uri: op.uri,
                author: op.author,
                createdAt: op.record.createdAt,
            };

            channel.publish(
                firehoseExchange,
                "repost.create",
                Buffer.from(JSON.stringify(data)),
            );
        }

        for (const op of opsByType.reposts.deletes) {
            const data = {
                uri: op.uri,
            };
            channel.publish(
                firehoseExchange,
                "repost.delete",
                Buffer.from(JSON.stringify(data)),
            );
        }

        for (const op of opsByType.likes.creates) {
            const data = {
                uri: op.uri,
                author: op.author,
                createdAt: op.record.createdAt,
            };
            channel.publish(
                firehoseExchange,
                "like.create",
                Buffer.from(JSON.stringify(data)),
            );
        }

        for (const op of opsByType.likes.deletes) {
            const data = {
                uri: op.uri,
            };

            channel.publish(
                firehoseExchange,
                "like.delete",
                Buffer.from(JSON.stringify(data)),
            );
        }

        for (const op of opsByType.follows.creates) {
            const data = {
                uri: op.uri,
                author: op.author,
                createdAt: op.record.createdAt,
            };

            channel.publish(
                firehoseExchange,
                "follow.create",
                Buffer.from(JSON.stringify(data)),
            );
        }

        for (const op of opsByType.follows.deletes) {
            const data = {
                uri: op.uri,
            };

            channel.publish(
                firehoseExchange,
                "follow.delete",
                Buffer.from(JSON.stringify(data)),
            );
        }
    },
});

firehose.run(5000);
LOGGER.info("Firehose running");
