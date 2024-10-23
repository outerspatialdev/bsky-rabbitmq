import * as dotenv from "dotenv";
dotenv.config();

import z from "zod";

const EnvVarSchema = z.object({
    LOG_LEVEL: z.string().default("info"),
    NODE_ENV: z.string().default("development"),
});

export const ENV = EnvVarSchema.parse(process.env);
export const IS_DEV_MODE = ENV.NODE_ENV === "development";
