# Alethea Authenticity Engine 

A comprehensive AI-powered platform for detecting misinformation and analyzing content authenticity across text, images, and videos.

## Features 

- **News Summarization**: Aggregate and summarize news from multiple sources using NewsAPI and GDELT
- **Text Analysis**: Detect misinformation in text content and URLs using advanced AI analysis
- **Image Analysis**: Identify deepfakes and manipulated images with computer vision
- **Video Analysis**: Analyze video content for authenticity using multi-modal AI
- **Multi-modal Detection**: Comprehensive analysis across different content types
- **Real-time Processing**: Fast analysis with caching and optimization
- **Security**: Built-in rate limiting, input sanitization, and security headers

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React 19, TypeScript, Tailwind CSS
- **AI Services**: Google Gemini, Hugging Face Transformers, OpenAI Whisper
- **APIs**: NewsAPI, GDELT Project
- **Media Processing**: FFmpeg, Sharp, OCR
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel with optimized serverless functions

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for external services

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alethea-authenticity-engine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your API keys in `.env.local`

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

### Required API Keys

```env
# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# News Sources
NEWS_API_KEY=your_news_api_key_here
GDELT_API_KEY=your_gdelt_api_key_here

# Application Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Optional Configuration

```env
# Security & Performance
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
MAX_FILE_SIZE=50000000
MAX_VIDEO_SIZE=100000000
CACHE_TTL_SECONDS=300
```

## API Endpoints

### News API
- `POST /api/news` - Aggregate and summarize news articles
- `GET /api/news?query=...` - Search news with query parameters

### Content Detection APIs
- `POST /api/detector/text` - Analyze text content or URLs
- `POST /api/detector/image` - Analyze image authenticity
- `POST /api/detector/video` - Analyze video content

### System APIs
- `GET /api/health` - Health check and system status

## Usage Examples

### Text Analysis
```javascript
const response = await fetch('/api/detector/text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Content to analyze..."
  })
});
```

### Image Analysis
```javascript
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/detector/image', {
  method: 'POST',
  body: formData
});
```

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run verify       # Run all checks (type, lint, test)
```

### Testing

The project includes comprehensive tests:

- **Unit Tests**: Component and service testing
- **Integration Tests**: API endpoint testing
- **Coverage Reports**: Detailed test coverage analysis

Run tests:
```bash
npm test                # Run all tests
npm run test:coverage   # Run with coverage report
npm run test:ci         # Run in CI mode
```

## Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel deploy
   ```

3. **Set Environment Variables**
   Configure all required environment variables in the Vercel dashboard

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Architecture

### Frontend Architecture
- **App Router**: Next.js 14 App Router for optimal performance
- **Component Structure**: Modular, reusable React components
- **State Management**: React hooks and context
- **Styling**: Tailwind CSS with responsive design

### Backend Architecture
- **API Routes**: Serverless functions with Next.js API routes
- **Service Layer**: Modular services for AI, news, and media processing
- **Security Layer**: Input validation, rate limiting, sanitization
- **Caching Layer**: In-memory caching for improved performance

### AI Integration
- **Multi-Provider**: Support for multiple AI services
- **Fallback Mechanisms**: Graceful degradation when services fail
- **Confidence Scoring**: Transparent confidence metrics
- **Reasoning**: Detailed explanations for all analyses

## Security Features

- **Input Sanitization**: XSS and injection prevention
- **Rate Limiting**: API abuse prevention
- **File Validation**: Secure file upload handling
- **Security Headers**: CORS, CSP, and other security headers
- **Error Handling**: Secure error responses without information leakage

## Performance Optimizations

- **Caching**: Intelligent caching of API responses
- **Code Splitting**: Optimized bundle loading
- **Image Optimization**: Next.js Image component
- **Serverless Functions**: Optimized for Vercel deployment
- **Lazy Loading**: Components loaded on demand

## License

This project is licensed under the MIT License.
