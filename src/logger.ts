import pino from "pino";
import { ENV } from "./config";

export const LOGGER = pino({
    level: ENV.LOG_LEVEL,
});
