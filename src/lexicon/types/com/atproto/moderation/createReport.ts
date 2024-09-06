/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type HeadersMap, XRPCError } from "@atproto/xrpc";
import { ValidationResult, BlobRef } from "@atproto/lexicon";
import { isObj, hasProp } from "../../../../util";
import { lexicons } from "../../../../lexicons";
import { CID } from "multiformats/cid";
import type * as ComAtprotoModerationDefs from "./defs";
import type * as ComAtprotoAdminDefs from "../admin/defs";
import type * as ComAtprotoRepoStrongRef from "../repo/strongRef";

export type QueryParams = {};

export interface InputSchema {
    reasonType: ComAtprotoModerationDefs.ReasonType;
    /** Additional context about the content and violation. */
    reason?: string;
    subject:
        | ComAtprotoAdminDefs.RepoRef
        | ComAtprotoRepoStrongRef.Main
        | { $type: string; [k: string]: unknown };
    [k: string]: unknown;
}

export interface OutputSchema {
    id: number;
    reasonType: ComAtprotoModerationDefs.ReasonType;
    reason?: string;
    subject:
        | ComAtprotoAdminDefs.RepoRef
        | ComAtprotoRepoStrongRef.Main
        | { $type: string; [k: string]: unknown };
    reportedBy: string;
    createdAt: string;
    [k: string]: unknown;
}

export interface CallOptions {
    signal?: AbortSignal;
    headers?: HeadersMap;
    qp?: QueryParams;
    encoding?: "application/json";
}

export interface Response {
    success: boolean;
    headers: HeadersMap;
    data: OutputSchema;
}

export function toKnownErr(e: any) {
    return e;
}
