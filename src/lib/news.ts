import axios from 'axios';
import { geminiService } from './gemini';
import { NewsArticle, NewsRequest, NewsResponse } from '@/types';

export class NewsService {
    private newsApiKey = process.env.NEWS_API_KEY;
    private gdeltApiKey = process.env.GDELT_API_KEY;

    /**
     * Fetch articles from NewsAPI
     */
    private async fetchFromNewsAPI(query: string, page: number = 1, pageSize: number = 10) {
        if (!this.newsApiKey) {
            throw new Error('NewsAPI key not configured');
        }

        try {
            const response = await axios.get('https://newsapi.org/v2/everything', {
                params: {
                    q: query,
                    apiKey: this.newsApiKey,
                    page,
                    pageSize,
                    sortBy: 'publishedAt',
                    language: 'en'
                }
            });

            return response.data.articles.map((article: any) => ({
                id: `newsapi_${Date.now()}_${Math.random()}`,
                title: article.title,
                content: article.content || article.description || '',
                url: article.url,
                source: article.source.name,
                publishedAt: new Date(article.publishedAt),
                summary: '' // Will be generated later
            }));
        } catch (error) {
            console.error('Error fetching from NewsAPI:', error);
            return [];
        }
    }

    /**
     * Fetch articles from GDELT (fallback/additional source)
     */
    private async fetchFromGDELT(query: string) {
        try {
            // GDELT API endpoint for article search
            const response = await axios.get('https://api.gdeltproject.org/api/v2/doc/doc', {
                params: {
                    query,
                    mode: 'artlist',
                    maxrecords: 10,
                    format: 'json'
                }
            });

            if (response.data && response.data.articles) {
                return response.data.articles.map((article: any) => ({
                    id: `gdelt_${Date.now()}_${Math.random()}`,
                    title: article.title,
                    content: article.content || '',
                    url: article.url,
                    source: article.domain,
                    publishedAt: new Date(article.seendate),
                    summary: ''
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching from GDELT:', error);
            return [];
        }
    }

    /**
     * Aggregate articles from multiple sources
     */
    async aggregateNews(request: NewsRequest): Promise<NewsResponse> {
        const { query, limit = 10, page = 1 } = request;

        try {
            // Fetch from multiple sources
            const [newsApiArticles, gdeltArticles] = await Promise.all([
                this.fetchFromNewsAPI(query, page, Math.ceil(limit / 2)),
                this.fetchFromGDELT(query)
            ]);

            // Combine and deduplicate articles
            const allArticles = [...newsApiArticles, ...gdeltArticles];
            const uniqueArticles = this.deduplicateArticles(allArticles);

            // Limit results
            const limitedArticles = uniqueArticles.slice(0, limit);

            // Generate summaries for articles
            const articlesWithSummaries = await this.generateSummaries(limitedArticles);

            return {
                articles: articlesWithSummaries.map(article => ({
                    title: article.title,
                    summary: article.summary,
                    url: article.url,
                    source: article.source,
                    publishedAt: article.publishedAt.toISOString()
                })),
                totalResults: uniqueArticles.length
            };
        } catch (error) {
            console.error('Error aggregating news:', error);
            throw new Error('Failed to fetch news articles');
        }
    }

    /**
     * Remove duplicate articles based on title similarity
     */
    private deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
        const seen = new Set<string>();
        return articles.filter(article => {
            const normalizedTitle = article.title.toLowerCase().replace(/[^\w\s]/g, '');
            if (seen.has(normalizedTitle)) {
                return false;
            }
            seen.add(normalizedTitle);
            return true;
        });
    }

    /**
     * Generate summaries for articles using Gemini
     */
    private async generateSummaries(articles: NewsArticle[]): Promise<NewsArticle[]> {
        const summaryPromises = articles.map(async (article) => {
            try {
                const summary = await geminiService.summarizeArticle(article.content, 50);
                return { ...article, summary };
            } catch (error) {
                console.error(`Error summarizing article ${article.id}:`, error);
                return {
                    ...article,
                    summary: article.content.substring(0, 200) + '...' // Fallback summary
                };
            }
        });

        return Promise.all(summaryPromises);
    }

    /**
     * Rate limiting helper
     */
    private async rateLimitDelay(ms: number = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const newsService = new NewsService();