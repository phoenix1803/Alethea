'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import NewsCard from '@/components/NewsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { NewsResponse } from '@/types';

export default function NewsPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NewsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const handleSearch = async (searchQuery: string, page: number = 1) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: searchQuery,
                    limit: 10,
                    page
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to fetch news');
            }

            const data: NewsResponse = await response.json();
            setResults(data);
            setCurrentPage(page);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query, 1);
    };

    const handlePageChange = (newPage: number) => {
        handleSearch(query, newPage);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-4">News Summarizer</h1>
                    <p className="text-gray-400 mb-8">
                        Search for news articles and get AI-powered summaries from multiple sources
                    </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex gap-4 max-w-2xl mx-auto">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter keywords, topics, or locations..."
                            className="flex-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 transition-colors font-medium"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <LoadingSpinner size="lg" text="Fetching and summarizing articles..." />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-900 border border-red-800 rounded-lg p-4 mb-8 text-center">
                        <p className="text-red-200">Error: {error}</p>
                    </div>
                )}

                {/* Results */}
                {results && !loading && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-400">
                                Found {results.totalResults} articles for "{query}"
                            </p>
                            <div className="text-sm text-gray-500">
                                Page {currentPage}
                            </div>
                        </div>

                        {/* Articles Grid */}
                        <div className="grid gap-6 mb-8">
                            {results.articles.map((article, index) => (
                                <NewsCard
                                    key={`${article.url}_${index}`}
                                    title={article.title}
                                    summary={article.summary}
                                    url={article.url}
                                    source={article.source}
                                    publishedAt={article.publishedAt}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {results.totalResults > 10 && (
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-gray-400">
                                    Page {currentPage}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={results.articles.length < 10 || loading}
                                    className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!results && !loading && !error && (
                    <div className="text-center py-12">
                        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-md mx-auto">
                            <h3 className="text-xl font-semibold text-white mb-2">Start Your Search</h3>
                            <p className="text-gray-400">
                                Enter keywords, topics, or locations to find and summarize relevant news articles.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}