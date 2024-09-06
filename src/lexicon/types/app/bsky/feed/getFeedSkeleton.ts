/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type HeadersMap, XRPCError } from "@atproto/xrpc";
import { ValidationResult, BlobRef } from "@atproto/lexicon";
import { isObj, hasProp } from "../../../../util";
import { lexicons } from "../../../../lexicons";
import { CID } from "multiformats/cid";
import type * as AppBskyFeedDefs from "./defs";

export interface QueryParams {
    /** Reference to feed generator record describing the specific feed being requested. */
    feed: string;
    limit?: number;
    cursor?: string;
}

export type InputSchema = undefined;

export interface OutputSchema {
    cursor?: string;
    feed: AppBskyFeedDefs.SkeletonFeedPost[];
    [k: string]: unknown;
}

export interface CallOptions {
    signal?: AbortSignal;
    headers?: HeadersMap;
}

export interface Response {
    success: boolean;
    headers: HeadersMap;
    data: OutputSchema;
}

export class UnknownFeedError extends XRPCError {
    constructor(src: XRPCError) {
        super(src.status, src.error, src.message, src.headers, { cause: src });
    }
}

export function toKnownErr(e: any) {
    if (e instanceof XRPCError) {
        if (e.error === "UnknownFeed") return new UnknownFeedError(e);
    }

    return e;
}
