import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            <span className="text-gray-300">Alethea</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Comprehensive fake content detection and intelligent news summarization.
            Analyze text, images, and videos for authenticity using advanced AI models.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* News Summarizer Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:border-gray-700 transition-colors">
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-bold text-white">News Summarizer</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Search and get concise summaries from multiple news sources.
              Stay informed with AI-powered article summarization from 20+ trusted sources.
            </p>
            <ul className="text-sm text-gray-500 mb-6 space-y-2">
              <li>• Multi-source news aggregation</li>
              <li>• AI-powered 50-word summaries</li>
              <li>• Pagination and search filters</li>
              <li>• Source credibility indicators</li>
            </ul>
            <Link
              href="/news"
              className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Start Summarizing
              <span className="ml-2">→</span>
            </Link>
          </div>

          {/* Content Detector Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:border-gray-700 transition-colors">
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Content Detector</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Detect fake content across text, images, and videos.
              Advanced AI analysis for deepfakes, misinformation, and AI-generated content.
            </p>
            <ul className="text-sm text-gray-500 mb-6 space-y-2">
              <li>• Text misinformation detection</li>
              <li>• Image manipulation analysis</li>
              <li>• Deepfake video detection</li>
              <li>• Confidence scores & explanations</li>
            </ul>
            <Link
              href="/detector"
              className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Start Detecting
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Upload or Search</h3>
              <p className="text-gray-400">
                Submit text, images, videos, or search for news articles using keywords or topics.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">AI Analysis</h3>
              <p className="text-gray-400">
                Advanced AI models analyze content for authenticity, manipulation, and misinformation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Get Results</h3>
              <p className="text-gray-400">
                Receive detailed analysis with confidence scores, explanations, and actionable insights.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Alethea Authenticity Engine. Powered by advanced AI models.
          </p>
        </div>
      </footer>
    </div>
  );
}