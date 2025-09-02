import { CacheService } from '../cache';

describe('CacheService', () => {
    beforeEach(() => {
        CacheService.clear();
    });

    describe('set and get', () => {
        it('should store and retrieve data', () => {
            const testData = { message: 'test' };
            CacheService.set('test-key', testData, 60000);

            const result = CacheService.get('test-key');
            expect(result).toEqual(testData);
        });

        it('should return null for non-existent keys', () => {
            const result = CacheService.get('non-existent');
            expect(result).toBeNull();
        });

        it('should return null for expired items', (done) => {
            CacheService.set('test-key', 'test-data', 10); // 10ms TTL

            setTimeout(() => {
                const result = CacheService.get('test-key');
                expect(result).toBeNull();
                done();
            }, 20);
        });
    });

    describe('delete', () => {
        it('should delete existing items', () => {
            CacheService.set('test-key', 'test-data', 60000);
            const deleted = CacheService.delete('test-key');

            expect(deleted).toBe(true);
            expect(CacheService.get('test-key')).toBeNull();
        });

        it('should return false for non-existent items', () => {
            const deleted = CacheService.delete('non-existent');
            expect(deleted).toBe(false);
        });
    });

    describe('generateNewsKey', () => {
        it('should generate consistent keys', () => {
            const key1 = CacheService.generateNewsKey('test query', 1, 10);
            const key2 = CacheService.generateNewsKey('test query', 1, 10);
            expect(key1).toBe(key2);
        });

        it('should generate different keys for different parameters', () => {
            const key1 = CacheService.generateNewsKey('test query', 1, 10);
            const key2 = CacheService.generateNewsKey('test query', 2, 10);
            expect(key1).not.toBe(key2);
        });
    });

    describe('generateTextAnalysisKey', () => {
        it('should generate consistent keys for same text', () => {
            const text = 'This is a test text for analysis';
            const key1 = CacheService.generateTextAnalysisKey(text);
            const key2 = CacheService.generateTextAnalysisKey(text);
            expect(key1).toBe(key2);
        });

        it('should generate different keys for different text', () => {
            const key1 = CacheService.generateTextAnalysisKey('text 1');
            const key2 = CacheService.generateTextAnalysisKey('text 2');
            expect(key1).not.toBe(key2);
        });
    });

    describe('cleanup', () => {
        it('should remove expired items', (done) => {
            CacheService.set('expired-key', 'data', 10); // 10ms TTL
            CacheService.set('valid-key', 'data', 60000); // 60s TTL

            setTimeout(() => {
                CacheService.cleanup();

                expect(CacheService.get('expired-key')).toBeNull();
                expect(CacheService.get('valid-key')).not.toBeNull();
                done();
            }, 20);
        });
    });

    describe('getStats', () => {
        it('should return cache statistics', () => {
            CacheService.set('key1', 'data1', 60000);
            CacheService.set('key2', 'data2', 60000);

            const stats = CacheService.getStats();
            expect(stats.totalItems).toBe(2);
            expect(stats.expiredItems).toBe(0);
            expect(stats.memoryUsage).toBeGreaterThan(0);
        });
    });
});