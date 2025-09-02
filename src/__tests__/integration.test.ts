/**
 * Integration tests for the Alethea Authenticity Engine
 * Tests the complete workflow from frontend to backend
 */

import { NextRequest } from 'next/server';

// Mock all external dependencies
jest.mock('@/lib/gemini', () => ({
    geminiService: {
        analyzeText: jest.fn().mockResolvedValue({
            isAuthentic: true,
            confidence: 0.85,
            reasoning: 'Content appears authentic based on analysis'
        }),
        summarizeArticle: jest.fn().mockResolvedValue('Test summary')
    }
}));

jest.mock('@/lib/news', () => ({
    newsService: {
        aggregateNews: jest.fn().mockResolvedValue({
            articles: [
                {
                    title: 'Test Article',
                    summary: 'Test summary',
                    url: 'https://example.com',
                    source: 'Test Source',
                    publishedAt: '2024-01-01T00:00:00Z'
                }
            ],
            totalResults: 1
        })
    }
}));

jest.mock('@/lib/security', () => ({
    SecurityService: {
        generateRequestId: () => 'test-request-id',
        getClientIP: () => '127.0.0.1',
        checkRateLimit: () => ({ allowed: true }),
        sanitizeText: (text: string) => text,
        validateURL: () => ({ isValid: true })
    }
}));

jest.mock('@/lib/cache', () => ({
    CacheService: {
        generateNewsKey: () => 'test-cache-key',
        generateDetectionKey: () => 'test-detection-key',
        get: () => null,
        set: () => { }
    }
}));

describe('Integration Tests', () => {
    describe('News API Integration', () => {
        it('should handle complete news workflow', async () => {
            const { POST } = await import('@/app/api/news/route');

            const request = new NextRequest('http://localhost:3000/api/news', {
                method: 'POST',
                body: JSON.stringify({
                    query: 'technology news',
                    limit: 5
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.articles).toBeDefined();
            expect(data.totalResults).toBeDefined();
            expect(Array.isArray(data.articles)).toBe(true);
        });
    });

    describe('Text Detection Integration', () => {
        it('should handle complete text analysis workflow', async () => {
            const { POST } = await import('@/app/api/detector/text/route');

            const request = new NextRequest('http://localhost:3000/api/detector/text', {
                method: 'POST',
                body: JSON.stringify({
                    text: 'This is a test article about current events.'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.isAuthentic).toBeDefined();
            expect(data.confidence).toBeDefined();
            expect(data.reasoning).toBeDefined();
            expect(typeof data.confidence).toBe('number');
            expect(data.confidence).toBeGreaterThanOrEqual(0);
            expect(data.confidence).toBeLessThanOrEqual(1);
        });
    });

    describe('Health Check Integration', () => {
        it('should return system health status', async () => {
            const { GET } = await import('@/app/api/health/route');

            const request = new NextRequest('http://localhost:3000/api/health');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.status).toBe('healthy');
            expect(data.timestamp).toBeDefined();
            expect(data.services).toBeDefined();
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle validation errors consistently', async () => {
            const { POST } = await import('@/app/api/news/route');

            const request = new NextRequest('http://localhost:3000/api/news', {
                method: 'POST',
                body: JSON.stringify({}), // Missing required query
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBeDefined();
            expect(data.error.code).toBe('VALIDATION_ERROR');
            expect(data.error.requestId).toBeDefined();
        });

        it('should handle service errors gracefully', async () => {
            // Mock service to throw error
            const { newsService } = require('@/lib/news');
            newsService.aggregateNews.mockRejectedValueOnce(new Error('Service error'));

            const { POST } = await import('@/app/api/news/route');

            const request = new NextRequest('http://localhost:3000/api/news', {
                method: 'POST',
                body: JSON.stringify({
                    query: 'test query'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBeDefined();
            expect(data.error.code).toBe('NEWS_FETCH_ERROR');
        });
    });

    describe('Security Integration', () => {
        it('should apply security measures across all endpoints', async () => {
            const { POST } = await import('@/app/api/detector/text/route');

            const request = new NextRequest('http://localhost:3000/api/detector/text', {
                method: 'POST',
                body: JSON.stringify({
                    text: '<script>alert("xss")</script>This is malicious content'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const response = await POST(request);

            // Should not fail due to security measures
            expect(response.status).toBe(200);
        });
    });
});

describe('System Performance Tests', () => {
    it('should handle concurrent requests', async () => {
        const { GET } = await import('@/app/api/health/route');

        const requests = Array(5).fill(null).map(() =>
            GET(new NextRequest('http://localhost:3000/api/health'))
        );

        const responses = await Promise.all(requests);

        responses.forEach(response => {
            expect(response.status).toBe(200);
        });
    });

    it('should complete requests within reasonable time', async () => {
        const { GET } = await import('@/app/api/health/route');

        const startTime = Date.now();
        const response = await GET(new NextRequest('http://localhost:3000/api/health'));
        const endTime = Date.now();

        expect(response.status).toBe(200);
        expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
});