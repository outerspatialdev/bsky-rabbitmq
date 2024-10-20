import { ENV } from "./config";
import { Firehose, getOpsByType } from "./helpers/firehose";
import { LOGGER } from "./logger";

import { DidResolver, MemoryCache } from "@atproto/identity";
import amqp from "amqplib";
import type {
    FollowCreated,
    FollowDeleted,
    LikeCreated,
    LikeDeleted,
    PostCreated,
    PostDeleted,
    RepostCreated,
    RepostDeleted,
} from "./bsky/post";
import { getRabbitUrl } from "./rabbit";

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
    service: ENV.BSKY_FIREHOSE_URL,
    handler: async (evt) => {
        const opsByType = await getOpsByType(evt);
        if (!opsByType) return;

        opCount += opsByType.posts.creates.length;
        for (const op of opsByType.posts.creates) {
            const data = {
                op: "post.create",
                uri: op.uri,
                text: op.record.text,
                author: op.author,
                createdAt: op.record.createdAt,
                langs: op.record.langs ?? [],
                data: op,
            } satisfies PostCreated;
            channel.publish(
                firehoseExchange,
                "post.create",
                Buffer.from(JSON.stringify(data)),
            );
        }

        opCount += opsByType.posts.deletes.length;
        for (const op of opsByType.posts.deletes) {
            const data = {
                op: "post.delete",
                uri: op.uri,
                data: op,
            } satisfies PostDeleted;

            channel.publish(
                firehoseExchange,
                "post.delete",
                Buffer.from(JSON.stringify(data)),
            );
        }

        opCount += opsByType.reposts.creates.length;
        for (const op of opsByType.reposts.creates) {
            const data = {
                op: "repost.create",
                uri: op.uri,
                author: op.author,
                createdAt: op.record.createdAt,
                data: op,
            } satisfies RepostCreated;

            channel.publish(
                firehoseExchange,
                "repost.create",
                Buffer.from(JSON.stringify(data)),
            );
        }

        opCount += opsByType.reposts.deletes.length;
        for (const op of opsByType.reposts.deletes) {
            const data = {
                op: "repost.delete",
                uri: op.uri,
                data: op,
            } satisfies RepostDeleted;

            channel.publish(
                firehoseExchange,
                "repost.delete",
                Buffer.from(JSON.stringify(data)),
            );
        }

        opCount += opsByType.likes.creates.length;
        for (const op of opsByType.likes.creates) {
            const data = {
                op: "like.create",
                uri: op.uri,
                author: op.author,
                createdAt: op.record.createdAt,
                data: op,
            } satisfies LikeCreated;

            channel.publish(
                firehoseExchange,
                "like.create",
                Buffer.from(JSON.stringify(data)),
            );
        }

        opCount += opsByType.likes.deletes.length;
        for (const op of opsByType.likes.deletes) {
            const data = {
                op: "like.delete",
                uri: op.uri,
                data: op,
            } satisfies LikeDeleted;

            channel.publish(
                firehoseExchange,
                "like.delete",
                Buffer.from(JSON.stringify(data)),
            );
        }

        opCount += opsByType.follows.creates.length;
        for (const op of opsByType.follows.creates) {
            const data = {
                op: "follow.create",
                uri: op.uri,
                author: op.author,
                createdAt: op.record.createdAt,
                data: op,
            } satisfies FollowCreated;

            channel.publish(
                firehoseExchange,
                "follow.create",
                Buffer.from(JSON.stringify(data)),
            );
        }

        opCount += opsByType.follows.deletes.length;
        for (const op of opsByType.follows.deletes) {
            const data = {
                op: "follow.delete",
                uri: op.uri,
                data: op,
            } satisfies FollowDeleted;

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
