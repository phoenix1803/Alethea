/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

// Mock the dependencies before importing
jest.mock('@/lib/news', () => ({
    newsService: {
        aggregateNews: jest.fn()
    }
}));

jest.mock('@/lib/security', () => ({
    SecurityService: {
        generateRequestId: () => 'test-request-id',
        getClientIP: () => '127.0.0.1',
        checkRateLimit: () => ({ allowed: true }),
        sanitizeText: (text: string) => text.trim()
    }
}));

jest.mock('@/lib/cache', () => ({
    CacheService: {
        generateNewsKey: () => 'test-cache-key',
        get: () => null,
        set: jest.fn()
    }
}));

import { POST, GET } from '../news/route';
import { newsService } from '@/lib/news';

describe('/api/news', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST', () => {
        it('should return news results for valid request', async () => {
            const mockResults = {
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
            };

            (newsService.aggregateNews as jest.Mock).mockResolvedValue(mockResults);

            const request = new NextRequest('http://localhost:3000/api/news', {
                method: 'POST',
                body: JSON.stringify({ query: 'test query' }),
                headers: { 'Content-Type': 'application/json' }
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockResults);
            expect(newsService.aggregateNews).toHaveBeenCalledWith({
                query: 'test query',
                limit: 10,
                page: 1
            });
        });

        it('should return validation error for missing query', async () => {
            const request = new NextRequest('http://localhost:3000/api/news', {
                method: 'POST',
                body: JSON.stringify({}),
                headers: { 'Content-Type': 'application/json' }
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error.code).toBe('VALIDATION_ERROR');
        });

        it('should handle service errors', async () => {
            (newsService.aggregateNews as jest.Mock).mockRejectedValue(new Error('Service error'));

            const request = new NextRequest('http://localhost:3000/api/news', {
                method: 'POST',
                body: JSON.stringify({ query: 'test query' }),
                headers: { 'Content-Type': 'application/json' }
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error.code).toBe('NEWS_FETCH_ERROR');
        });
    });

    describe('GET', () => {
        it('should return news results for valid query parameter', async () => {
            const mockResults = {
                articles: [],
                totalResults: 0
            };

            (newsService.aggregateNews as jest.Mock).mockResolvedValue(mockResults);

            const request = new NextRequest('http://localhost:3000/api/news?query=test');

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockResults);
        });

        it('should return validation error for missing query parameter', async () => {
            const request = new NextRequest('http://localhost:3000/api/news');

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error.code).toBe('VALIDATION_ERROR');
        });
    });
});