interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

export class CacheService {
    private static cache = new Map<string, CacheItem<any>>();

    /**
     * Set cache item with TTL
     */
    static set<T>(key: string, data: T, ttlMs: number = 300000): void { // Default 5 minutes
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttlMs
        });
    }

    /**
     * Get cache item if not expired
     */
    static get<T>(key: string): T | null {
        const item = this.cache.get(key);

        if (!item) return null;

        const now = Date.now();
        if (now - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    /**
     * Delete cache item
     */
    static delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    static clear(): void {
        this.cache.clear();
    }

    /**
     * Generate cache key for news requests
     */
    static generateNewsKey(query: string, page: number, limit: number): string {
        return `news:${query.toLowerCase()}:${page}:${limit}`;
    }

    /**
     * Generate cache key for text analysis
     */
    static generateTextAnalysisKey(text: string): string {
        // Use hash of text to avoid storing sensitive content in key
        const hash = this.simpleHash(text);
        return `text_analysis:${hash}`;
    }

    /**
     * Generate cache key for URL analysis
     */
    static generateUrlAnalysisKey(url: string): string {
        return `url_analysis:${encodeURIComponent(url)}`;
    }

    /**
     * Simple hash function for cache keys
     */
    private static simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Clean up expired cache items
     */
    static cleanup(): void {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache statistics
     */
    static getStats(): {
        totalItems: number;
        expiredItems: number;
        memoryUsage: number;
    } {
        const now = Date.now();
        let expiredItems = 0;

        for (const [, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                expiredItems++;
            }
        }

        return {
            totalItems: this.cache.size,
            expiredItems,
            memoryUsage: JSON.stringify([...this.cache.entries()]).length
        };
    }
}

// Cleanup expired cache items every 10 minutes
if (typeof window === 'undefined') {
    setInterval(() => {
        CacheService.cleanup();
    }, 10 * 60 * 1000);
}