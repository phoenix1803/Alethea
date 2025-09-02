import { POST } from '../detector/text/route';
import { NextRequest } from 'next/server';

// Mock the dependencies
jest.mock('@/lib/textAnalysis', () => ({
    textAnalysisService: {
        analyzeText: jest.fn(),
        extractFromURL: jest.fn()
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
        generateDetectionKey: () => 'test-cache-key',
        get: () => null,
        set: () => { }
    }
}));

describe('/api/detector/text', () => {
    it('should analyze text content', async () => {
        const { textAnalysisService } = require('@/lib/textAnalysis');
        textAnalysisService.analyzeText.mockResolvedValue({
            isAuthentic: false,
            confidence: 0.75,
            reasoning: 'Test reasoning',
            flags: ['suspicious-language']
        });

        const request = new NextRequest('http://localhost:3000/api/detector/text', {
            method: 'POST',
            body: JSON.stringify({
                text: 'This is test content'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.isAuthentic).toBe(false);
        expect(data.confidence).toBe(0.75);
    });

    it('should handle URL analysis', async () => {
        const { textAnalysisService } = require('@/lib/textAnalysis');
        textAnalysisService.extractFromURL.mockResolvedValue('Extracted content');
        textAnalysisService.analyzeText.mockResolvedValue({
            isAuthentic: true,
            confidence: 0.85,
            reasoning: 'Content appears authentic',
            flags: []
        });

        const request = new NextRequest('http://localhost:3000/api/detector/text', {
            method: 'POST',
            body: JSON.stringify({
                url: 'https://example.com/article'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.isAuthentic).toBe(true);
    });
});