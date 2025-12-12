import Redis from 'ioredis';

export interface StorageAdapter {
    set(sessionId: string, key: string, value: string): Promise<void>;
    get(sessionId: string, key: string): Promise<string | null>;
    getAll(sessionId: string): Promise<Record<string, string>>;
}

export class MemoryStore implements StorageAdapter {
    private store: Map<string, Map<string, string>> = new Map();

    async set(sessionId: string, key: string, value: string): Promise<void> {
        if (!this.store.has(sessionId)) {
            this.store.set(sessionId, new Map());
        }
        this.store.get(sessionId)!.set(key, value);
    }

    async get(sessionId: string, key: string): Promise<string | null> {
        return this.store.get(sessionId)?.get(key) || null;
    }

    async getAll(sessionId: string): Promise<Record<string, string>> {
        const sessionData = this.store.get(sessionId);
        if (!sessionData) return {};
        return Object.fromEntries(sessionData);
    }
}

export class RedisStore implements StorageAdapter {
    private client: Redis;

    constructor(redisUrl: string) {
        this.client = new Redis(redisUrl);
    }

    private getKey(sessionId: string): string {
        return `kavach:session:${sessionId}`;
    }

    async set(sessionId: string, key: string, value: string): Promise<void> {
        await this.client.hset(this.getKey(sessionId), key, value);
        // Set expiry for 24 hours
        await this.client.expire(this.getKey(sessionId), 86400);
    }

    async get(sessionId: string, key: string): Promise<string | null> {
        return await this.client.hget(this.getKey(sessionId), key);
    }

    async getAll(sessionId: string): Promise<Record<string, string>> {
        return await this.client.hgetall(this.getKey(sessionId));
    }
}
