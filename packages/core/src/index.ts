import { TokenManager } from './masking/manager.js';
import { MemoryStore, RedisStore, StorageAdapter } from './storage/index.js';

export interface KavachConfig {
    storage?: 'memory' | 'redis';
    redisUrl?: string;
}

export class Kavach {
    private manager: TokenManager;

    constructor(config: KavachConfig = {}) {
        let storage: StorageAdapter;

        if (config.storage === 'redis' && config.redisUrl) {
            storage = new RedisStore(config.redisUrl);
        } else {
            storage = new MemoryStore();
        }

        this.manager = new TokenManager(storage);
    }

    async sanitize(text: string, sessionId: string): Promise<string> {
        return this.manager.mask(text, sessionId);
    }

    async desanitize(text: string, sessionId: string): Promise<string> {
        return this.manager.unmask(text, sessionId);
    }
}

export { MemoryStore, RedisStore };
