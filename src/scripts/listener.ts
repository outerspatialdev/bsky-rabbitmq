import { Agent, CredentialSession } from "@atproto/api";
import { DidResolver, HandleResolver, MemoryCache } from "@atproto/identity";
import amqp from "amqplib";
import { v4 as uuid } from "uuid";
import { PostCreatedSchema } from "../bsky/post";
import { ENV } from "../config";
import { ProfileCache } from "../helpers/profile-cache";
import { LOGGER } from "../logger";
import { getRabbitUrl } from "../rabbit";

const connectUrl = getRabbitUrl();
const connection = await amqp.connect(connectUrl.toString());
const channel = await connection.createChannel();
const firehoseExchange = ENV.RABBIT_FIREHOSE_EXCHANGE;

const queueName = `firehose-test-${uuid()}`;
await channel.assertQueue(queueName, {
    autoDelete: true,
});
await channel.bindQueue(queueName, firehoseExchange, "post.create");

const didCache = new MemoryCache();
const didResolver = new DidResolver({
    plcUrl: "https://plc.directory",
    didCache,
});
const handleResolver = new HandleResolver({});

const session = new CredentialSession(new URL(ENV.BSKY_SERVICE_URL));
const agent = new Agent(session);

await session.login({
    identifier: ENV.BSKY_IDENTIFIER,
    password: ENV.BSKY_PASSWORD,
});

const profileCache = new ProfileCache({
    agent,
    handleResolver,
    max: ENV.PROFILE_CACHE_MAX,
    ttl: ENV.PROFILE_CACHE_TTL,
});

await channel.consume(queueName, async (msg) => {
    if (!msg) return;
    channel.ack(msg);

    try {
        const content = msg?.content.toString();
        if (!content) return;

        const data = PostCreatedSchema.parse(JSON.parse(content));

        if (!data.langs.includes("en")) return;

        const profile = await profileCache.getProfile(data.author);
        LOGGER.info(data, `${profile.handle}: ${data.text}`);
    } catch (e) {
        // logger.error(e);
    }
});
