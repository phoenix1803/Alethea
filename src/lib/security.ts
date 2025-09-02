import { NextRequest } from 'next/server';

export class SecurityService {
    /**
     * Sanitize text input to prevent XSS and injection attacks
     */
    static sanitizeText(input: string): string {
        if (!input || typeof input !== 'string') return '';

        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/javascript:[^"\s]*"[^"]*"/gi, '') // Remove javascript: URLs with content
            .replace(/javascript:[^"\s]*\([^)]*\)/gi, '') // Remove javascript: URLs with parentheses content
            .replace(/javascript:[^\s]*/gi, '') // Remove other javascript: URLs
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .trim();
    }

    /**
     * Validate file upload security
     */
    static validateFileUpload(file: File, allowedTypes: string[], maxSize: number): {
        isValid: boolean;
        error?: string;
    } {
        // Check file type
        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
            };
        }

        // Check file size
        if (file.size > maxSize) {
            const maxSizeMB = Math.round(maxSize / (1024 * 1024));
            return {
                isValid: false,
                error: `File too large. Maximum size: ${maxSizeMB}MB`
            };
        }

        // Check for suspicious file names
        const suspiciousPatterns = [
            /\.exe$/i,
            /\.bat$/i,
            /\.cmd$/i,
            /\.scr$/i,
            /\.pif$/i,
            /\.com$/i,
            /\.jar$/i,
            /\.php$/i,
            /\.asp$/i,
            /\.jsp$/i
        ];

        if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
            return {
                isValid: false,
                error: 'Suspicious file type detected'
            };
        }

        return { isValid: true };
    }

    /**
     * Rate limiting implementation
     */
    private static requestCounts = new Map<string, { count: number; resetTime: number }>();

    static checkRateLimit(
        identifier: string,
        maxRequests: number = 10,
        windowMs: number = 60000
    ): { allowed: boolean; resetTime?: number } {
        const now = Date.now();
        const record = this.requestCounts.get(identifier);

        if (!record || now > record.resetTime) {
            // Reset or create new record
            this.requestCounts.set(identifier, {
                count: 1,
                resetTime: now + windowMs
            });
            return { allowed: true };
        }

        if (record.count >= maxRequests) {
            return { allowed: false, resetTime: record.resetTime };
        }

        record.count++;
        return { allowed: true };
    }

    /**
     * Get client IP address for rate limiting
     */
    static getClientIP(request: NextRequest): string {
        const forwarded = request.headers.get('x-forwarded-for');
        const realIP = request.headers.get('x-real-ip');

        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }

        if (realIP) {
            return realIP;
        }

        return 'unknown';
    }

    /**
     * Validate URL input
     */
    static validateURL(url: string): { isValid: boolean; error?: string } {
        try {
            const urlObj = new URL(url);

            // Only allow HTTP and HTTPS
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return {
                    isValid: false,
                    error: 'Only HTTP and HTTPS URLs are allowed'
                };
            }

            // Block localhost and private IPs
            const hostname = urlObj.hostname.toLowerCase();
            if (
                hostname === 'localhost' ||
                hostname.startsWith('127.') ||
                hostname.startsWith('192.168.') ||
                hostname.startsWith('10.') ||
                hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
            ) {
                return {
                    isValid: false,
                    error: 'Private and localhost URLs are not allowed'
                };
            }

            return { isValid: true };
        } catch {
            return {
                isValid: false,
                error: 'Invalid URL format'
            };
        }
    }

    /**
     * Generate request ID for tracking
     */
    static generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    /**
     * Clean up old rate limit records
     */
    static cleanupRateLimitRecords(): void {
        const now = Date.now();
        for (const [key, record] of this.requestCounts.entries()) {
            if (now > record.resetTime) {
                this.requestCounts.delete(key);
            }
        }
    }
}

// Cleanup rate limit records every 5 minutes
if (typeof window === 'undefined') {
    setInterval(() => {
        SecurityService.cleanupRateLimitRecords();
    }, 5 * 60 * 1000);
}