import { SecurityService } from '../security';

describe('SecurityService', () => {
    describe('sanitizeText', () => {
        it('should remove script tags', () => {
            const input = 'Hello <script>alert("xss")</script> world';
            const result = SecurityService.sanitizeText(input);
            expect(result).toBe('Hello  world');
        });

        it('should remove HTML tags', () => {
            const input = 'Hello <div>world</div>';
            const result = SecurityService.sanitizeText(input);
            expect(result).toBe('Hello world');
        });

        it('should remove javascript: URLs', () => {
            const input = 'Click javascript:alert("xss") here';
            const result = SecurityService.sanitizeText(input);
            expect(result).toBe('Click ) here');
        });

        it('should handle empty input', () => {
            expect(SecurityService.sanitizeText('')).toBe('');
            expect(SecurityService.sanitizeText(null as any)).toBe('');
            expect(SecurityService.sanitizeText(undefined as any)).toBe('');
        });
    });

    describe('validateFileUpload', () => {
        const mockFile = (type: string, size: number, name: string = 'test.jpg') => ({
            type,
            size,
            name
        } as File);

        it('should validate correct file types', () => {
            const file = mockFile('image/jpeg', 1024 * 1024);
            const result = SecurityService.validateFileUpload(file, ['image/jpeg'], 10 * 1024 * 1024);
            expect(result.isValid).toBe(true);
        });

        it('should reject invalid file types', () => {
            const file = mockFile('application/exe', 1024);
            const result = SecurityService.validateFileUpload(file, ['image/jpeg'], 10 * 1024 * 1024);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Invalid file type');
        });

        it('should reject files that are too large', () => {
            const file = mockFile('image/jpeg', 20 * 1024 * 1024);
            const result = SecurityService.validateFileUpload(file, ['image/jpeg'], 10 * 1024 * 1024);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('File too large');
        });

        it('should reject suspicious file names', () => {
            const file = mockFile('image/jpeg', 1024, 'malware.exe');
            const result = SecurityService.validateFileUpload(file, ['image/jpeg'], 10 * 1024 * 1024);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Suspicious file type');
        });
    });

    describe('validateURL', () => {
        it('should validate HTTP URLs', () => {
            const result = SecurityService.validateURL('http://example.com');
            expect(result.isValid).toBe(true);
        });

        it('should validate HTTPS URLs', () => {
            const result = SecurityService.validateURL('https://example.com');
            expect(result.isValid).toBe(true);
        });

        it('should reject non-HTTP protocols', () => {
            const result = SecurityService.validateURL('ftp://example.com');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Only HTTP and HTTPS');
        });

        it('should reject localhost URLs', () => {
            const result = SecurityService.validateURL('http://localhost:3000');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Private and localhost URLs');
        });

        it('should reject private IP addresses', () => {
            const result = SecurityService.validateURL('http://192.168.1.1');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Private and localhost URLs');
        });

        it('should reject invalid URLs', () => {
            const result = SecurityService.validateURL('not-a-url');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Invalid URL format');
        });
    });

    describe('checkRateLimit', () => {
        beforeEach(() => {
            // Clear rate limit records before each test
            SecurityService.cleanupRateLimitRecords();
        });

        it('should allow requests within limit', () => {
            const result = SecurityService.checkRateLimit('test-ip', 5, 60000);
            expect(result.allowed).toBe(true);
        });

        it('should block requests exceeding limit', () => {
            // Make requests up to the limit
            for (let i = 0; i < 5; i++) {
                SecurityService.checkRateLimit('test-ip', 5, 60000);
            }

            // Next request should be blocked
            const result = SecurityService.checkRateLimit('test-ip', 5, 60000);
            expect(result.allowed).toBe(false);
            expect(result.resetTime).toBeDefined();
        });
    });
});