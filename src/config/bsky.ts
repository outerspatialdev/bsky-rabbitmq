import * as dotenv from "dotenv";
dotenv.config();

import z from "zod";

const EnvVarSchema = z.object({
    BSKY_IDENTIFIER: z.string(),
    BSKY_PASSWORD: z.string(),
    BSKY_FIREHOSE_URL: z.string().default("wss://bsky.network"),
    BSKY_SERVICE_URL: z.string().default("https://bsky.social"),
    PROFILE_CACHE_MAX: z.number().default(100),
    PROFILE_CACHE_TTL: z.number().default(1000 * 60 * 60),
});

export const BSKY_ENV = EnvVarSchema.parse(process.env);
