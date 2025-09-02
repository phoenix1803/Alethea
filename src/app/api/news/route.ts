import { NextRequest, NextResponse } from 'next/server';
import { newsService } from '@/lib/news';
import { SecurityService } from '@/lib/security';
import { CacheService } from '@/lib/cache';
import { ErrorHandler } from '@/lib/errorHandler';
import { NewsRequest } from '@/types';

export async function POST(request: NextRequest) {
    const requestId = SecurityService.generateRequestId();

    try {
        // Rate limiting
        const clientIP = SecurityService.getClientIP(request);
        const rateLimit = SecurityService.checkRateLimit(clientIP, 20, 60000); // 20 requests per minute

        if (!rateLimit.allowed) {
            return ErrorHandler.handleRateLimitError(rateLimit.resetTime!, requestId);
        }

        const body: NewsRequest = await request.json();

        // Validate and sanitize request
        if (!body.query || typeof body.query !== 'string') {
            return ErrorHandler.handleValidationError(
                'Query parameter is required and must be a string',
                requestId
            );
        }

        const sanitizedQuery = SecurityService.sanitizeText(body.query);
        if (!sanitizedQuery) {
            return ErrorHandler.handleValidationError(
                'Invalid query content',
                requestId
            );
        }

        // Set defaults
        const limit = Math.min(body.limit || 10, 50); // Max 50 articles
        const page = Math.max(body.page || 1, 1);

        const newsRequest: NewsRequest = {
            query: sanitizedQuery,
            limit,
            page
        };

        // Check cache first
        const cacheKey = CacheService.generateNewsKey(newsRequest.query, page, limit);
        const cachedResult = CacheService.get(cacheKey);

        if (cachedResult) {
            return NextResponse.json(cachedResult);
        }

        // Fetch news
        const result = await newsService.aggregateNews(newsRequest);

        // Cache result for 5 minutes
        CacheService.set(cacheKey, result, 300000);

        return NextResponse.json(result);
    } catch (error) {
        return ErrorHandler.createErrorResponse(
            error instanceof Error ? error : 'Failed to fetch news articles',
            'NEWS_FETCH_ERROR',
            500,
            requestId
        );
    }
}

export async function GET(request: NextRequest) {
    const requestId = SecurityService.generateRequestId();

    try {
        // Rate limiting
        const clientIP = SecurityService.getClientIP(request);
        const rateLimit = SecurityService.checkRateLimit(clientIP, 20, 60000);

        if (!rateLimit.allowed) {
            return ErrorHandler.handleRateLimitError(rateLimit.resetTime!, requestId);
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');

        if (!query) {
            return ErrorHandler.handleValidationError(
                'Query parameter is required',
                requestId
            );
        }

        const sanitizedQuery = SecurityService.sanitizeText(query);
        if (!sanitizedQuery) {
            return ErrorHandler.handleValidationError(
                'Invalid query content',
                requestId
            );
        }

        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
        const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);

        const newsRequest: NewsRequest = {
            query: sanitizedQuery,
            limit,
            page
        };

        // Check cache first
        const cacheKey = CacheService.generateNewsKey(newsRequest.query, page, limit);
        const cachedResult = CacheService.get(cacheKey);

        if (cachedResult) {
            return NextResponse.json(cachedResult);
        }

        const result = await newsService.aggregateNews(newsRequest);

        // Cache result
        CacheService.set(cacheKey, result, 300000);

        return NextResponse.json(result);
    } catch (error) {
        return ErrorHandler.createErrorResponse(
            error instanceof Error ? error : 'Failed to fetch news articles',
            'NEWS_FETCH_ERROR',
            500,
            requestId
        );
    }
}