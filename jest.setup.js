import '@testing-library/jest-dom'

// Set up test environment variables
process.env.GEMINI_API_KEY = 'test-api-key';
process.env.NEWS_API_KEY = 'test-news-api-key';
process.env.GDELT_API_KEY = 'test-gdelt-api-key';
process.env.HUGGINGFACE_API_KEY = 'test-hf-api-key';
process.env.WHISPER_API_KEY = 'test-whisper-api-key';

// Mock Request and Response for API tests
if (typeof globalThis.Request === 'undefined') {
    globalThis.Request = class MockRequest {
        constructor(url, options = {}) {
            this.url = url;
            this.method = options.method || 'GET';
            this.headers = new Map(Object.entries(options.headers || {}));
            this._body = options.body;
        }

        async json() {
            return JSON.parse(this._body || '{}');
        }

        async text() {
            return this._body || '';
        }
    };
}

if (typeof globalThis.Response === 'undefined') {
    globalThis.Response = class MockResponse {
        constructor(body, options = {}) {
            this.body = body;
            this.status = options.status || 200;
            this.statusText = options.statusText || 'OK';
            this.headers = new Map(Object.entries(options.headers || {}));
        }

        async json() {
            return JSON.parse(this.body || '{}');
        }

        async text() {
            return this.body || '';
        }

        static json(data, options = {}) {
            return new MockResponse(JSON.stringify(data), {
                ...options,
                headers: { 'Content-Type': 'application/json', ...options.headers }
            });
        }
    };
}