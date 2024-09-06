import * as dotenv from "dotenv";
dotenv.config();

import z from "zod";

const EnvVarSchema = z.object({
    LOG_LEVEL: z.string().default("info"),
    NODE_ENV: z.string().default("development"),
    BSKY_IDENTIFIER: z.string(),
    BSKY_PASSWORD: z.string(),
    BSKY_FIREHOSE_URL: z.string().default("wss://bsky.network"),
    BSKY_SERVICE_URL: z.string().default("https://bsky.social"),
    PROFILE_CACHE_MAX: z.number().default(100),
    PROFILE_CACHE_TTL: z.number().default(1000 * 60 * 60),

    RABBIT_HOST: z.string().default("localhost"),
    RABBIT_VHOST: z.string().default("/"),
    RABBIT_PORT: z.number().default(5672),
    RABBIT_FIREHOSE_EXCHANGE: z.string().default("firehose"),
    RABBIT_USER: z.string(),
    RABBIT_PASS: z.string(),
});

export const ENV = EnvVarSchema.parse(process.env);
export const IS_DEV_MODE = ENV.NODE_ENV === "development";
