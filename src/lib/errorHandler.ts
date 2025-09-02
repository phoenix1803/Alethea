import { NextResponse } from 'next/server';

export interface APIError {
    code: string;
    message: string;
    details?: any;
    timestamp: Date;
    requestId: string;
}

export class ErrorHandler {
    /**
     * Create standardized API error response
     */
    static createErrorResponse(
        error: Error | string,
        code: string = 'INTERNAL_ERROR',
        status: number = 500,
        requestId?: string
    ): NextResponse {
        const errorMessage = error instanceof Error ? error.message : error;
        const errorDetails = error instanceof Error ? error.stack : undefined;

        const apiError: APIError = {
            code,
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
            timestamp: new Date(),
            requestId: requestId || this.generateRequestId()
        };

        // Log error for monitoring
        this.logError(apiError, error);

        return NextResponse.json({ error: apiError }, { status });
    }

    /**
     * Handle validation errors
     */
    static handleValidationError(
        message: string,
        requestId?: string
    ): NextResponse {
        return this.createErrorResponse(
            message,
            'VALIDATION_ERROR',
            400,
            requestId
        );
    }

    /**
     * Handle rate limit errors
     */
    static handleRateLimitError(
        resetTime: number,
        requestId?: string
    ): NextResponse {
        const response = this.createErrorResponse(
            'Rate limit exceeded. Please try again later.',
            'RATE_LIMIT_EXCEEDED',
            429,
            requestId
        );

        // Add rate limit headers
        response.headers.set('X-RateLimit-Reset', resetTime.toString());
        response.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());

        return response;
    }

    /**
     * Handle file upload errors
     */
    static handleFileUploadError(
        message: string,
        requestId?: string
    ): NextResponse {
        return this.createErrorResponse(
            message,
            'FILE_UPLOAD_ERROR',
            400,
            requestId
        );
    }

    /**
     * Handle external API errors
     */
    static handleExternalAPIError(
        service: string,
        error: Error,
        requestId?: string
    ): NextResponse {
        const message = `External service error (${service}): ${error.message}`;
        return this.createErrorResponse(
            message,
            'EXTERNAL_API_ERROR',
            502,
            requestId
        );
    }

    /**
     * Log error for monitoring
     */
    private static logError(apiError: APIError, originalError?: Error | string): void {
        const logData = {
            ...apiError,
            originalError: originalError instanceof Error ? {
                name: originalError.name,
                message: originalError.message,
                stack: originalError.stack
            } : originalError,
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location.href : undefined
        };

        // In production, you'd send this to a logging service
        console.error('API Error:', JSON.stringify(logData, null, 2));
    }

    /**
     * Generate unique request ID
     */
    private static generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Wrap async function with error handling
     */
    static wrapAsync<T extends any[], R>(
        fn: (...args: T) => Promise<R>
    ): (...args: T) => Promise<R | NextResponse> {
        return async (...args: T) => {
            try {
                return await fn(...args);
            } catch (error) {
                console.error('Wrapped function error:', error);
                return this.createErrorResponse(
                    error instanceof Error ? error : 'Unknown error occurred'
                );
            }
        };
    }

    /**
     * Handle timeout errors
     */
    static handleTimeoutError(
        operation: string,
        requestId?: string
    ): NextResponse {
        return this.createErrorResponse(
            `Operation timed out: ${operation}`,
            'TIMEOUT_ERROR',
            408,
            requestId
        );
    }

    /**
     * Handle authentication errors
     */
    static handleAuthError(
        message: string = 'Authentication required',
        requestId?: string
    ): NextResponse {
        return this.createErrorResponse(
            message,
            'AUTH_ERROR',
            401,
            requestId
        );
    }

    /**
     * Handle authorization errors
     */
    static handleAuthorizationError(
        message: string = 'Insufficient permissions',
        requestId?: string
    ): NextResponse {
        return this.createErrorResponse(
            message,
            'AUTHORIZATION_ERROR',
            403,
            requestId
        );
    }
}

/**
 * Global error boundary for React components
 */
export class ErrorBoundary {
    static handleComponentError(error: Error, errorInfo: any): void {
        const errorData = {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            errorInfo,
            timestamp: new Date(),
            url: typeof window !== 'undefined' ? window.location.href : undefined
        };

        console.error('Component Error:', errorData);

        // In production, send to error tracking service
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }
}