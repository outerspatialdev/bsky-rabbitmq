import type { Agent } from "@atproto/api";
import type { HandleResolver } from "@atproto/identity";
import lodash from "lodash";
import { LRUCache } from "lru-cache";

export interface ProfileData {
    did: string;
    handle: string;
    name?: string;
    avatar?: string;
}

const DEFAULT_PROFILE_CACHE_MAX = 1000;
const DEFAULT_PROFILE_CACHE_TTL = 60 * 60 * 1000;

export interface ProfileCacheArgs {
    agent: Agent;
    handleResolver: HandleResolver;
    max?: number;
    ttl?: number;
}

export class ProfileCache {
    profileCache: LRUCache<string, ProfileData>;
    agent: Agent;
    handleResolver: HandleResolver;

    constructor(args: ProfileCacheArgs) {
        this.agent = args.agent;
        this.handleResolver = args.handleResolver;

        this.profileCache = new LRUCache<string, ProfileData>({
            max: args.max ?? DEFAULT_PROFILE_CACHE_MAX,
            ttl: args.ttl ?? DEFAULT_PROFILE_CACHE_TTL,
        });
    }

    async fetchProfiles(dids: string[]): Promise<ProfileData[]> {
        const result: ProfileData[] = [];
        if (dids.length === 0) return result;

        const didGroups = lodash.chunk(dids, 100);

        for (const group of didGroups) {
            const profiles = await this.agent.getProfiles({
                actors: group,
            });

            for (const profile of profiles.data.profiles) {
                const data: ProfileData = {
                    did: profile.did,
                    handle: profile.handle,
                    avatar: profile.avatar,
                    name: profile.displayName,
                };

                this.profileCache.set(data.did, data);

                result.push(data);
            }
        }

        return result;
    }

    async getProfiles(dids: string[]) {
        const myDids = lodash.uniq(dids);
        const missing: string[] = [];
        const found: ProfileData[] = [];

        for (const did of myDids) {
            const cached = this.profileCache.get(did);
            if (cached) {
                found.push(cached);
            } else {
                missing.push(did);
            }
        }

        for (const profile of await this.fetchProfiles(missing)) {
            found.push(profile);
        }

        return found;
    }

    async getProfile(did: string): Promise<ProfileData> {
        const found = this.profileCache.get(did);
        if (found) return found;

        const profiles = await this.fetchProfiles([did]);

        const profile = profiles[0];
        if (!profile) {
            throw new Error(`profile ${did} not found`);
        }
        return profile;
    }

    async getProfileByHandle(handle: string): Promise<ProfileData> {
        const did = await this.handleResolver.resolve(handle);
        if (!did) throw new Error("did not found");
        return this.getProfile(did);
    }
}
