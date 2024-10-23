import * as dotenv from "dotenv";
dotenv.config();

import z from "zod";

const EnvVarSchema = z.object({
    RABBIT_HOST: z.string().default("localhost"),
    RABBIT_VHOST: z.string().default("/"),
    RABBIT_PORT: z.string().default("5672"),
    RABBIT_FIREHOSE_EXCHANGE: z.string().default("firehose"),
    RABBIT_USER: z.string(),
    RABBIT_PASS: z.string(),
});

export const RABBIT_ENV = EnvVarSchema.parse(process.env);
