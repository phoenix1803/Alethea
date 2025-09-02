import axios from 'axios';
import * as cheerio from 'cheerio';
import { geminiService } from './gemini';
import { DetectionResult } from '@/types';

export class TextAnalysisService {
    /**
     * Analyze text content for authenticity and misinformation
     */
    async analyzeText(text: string): Promise<DetectionResult> {
        const startTime = Date.now();

        try {
            const analysis = await geminiService.analyzeTextAuthenticity(text);
            const processingTime = Date.now() - startTime;

            const result: DetectionResult = {
                contentType: 'text',
                authenticity: {
                    score: analysis.score,
                    classification: analysis.classification,
                    confidence: analysis.confidence
                },
                analysis: {
                    indicators: analysis.indicators,
                    reasoning: analysis.reasoning,
                    technicalDetails: {
                        textLength: text.length,
                        wordCount: text.split(/\s+/).length,
                        analysisMethod: 'gemini-1.5-flash'
                    }
                },
                metadata: {
                    processingTime,
                    modelsUsed: ['gemini-1.5-flash'],
                    timestamp: new Date()
                }
            };

            return result;
        } catch (error) {
            console.error('Error analyzing text:', error);
            throw new Error('Failed to analyze text content');
        }
    }

    /**
     * Extract content from URL and analyze it
     */
    async analyzeUrl(url: string): Promise<DetectionResult & { extractedContent: string }> {
        const startTime = Date.now();

        try {
            // Validate URL
            const urlObj = new URL(url);
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                throw new Error('Invalid URL protocol. Only HTTP and HTTPS are supported.');
            }

            // Extract content from URL
            const extractedContent = await this.extractContentFromUrl(url);

            if (!extractedContent || extractedContent.length < 50) {
                throw new Error('Unable to extract sufficient content from the provided URL');
            }

            // Analyze the extracted content
            const analysis = await geminiService.analyzeTextAuthenticity(extractedContent);
            const processingTime = Date.now() - startTime;

            const result: DetectionResult & { extractedContent: string } = {
                contentType: 'text',
                authenticity: {
                    score: analysis.score,
                    classification: analysis.classification,
                    confidence: analysis.confidence
                },
                analysis: {
                    indicators: analysis.indicators,
                    reasoning: analysis.reasoning,
                    technicalDetails: {
                        url,
                        extractedContentLength: extractedContent.length,
                        wordCount: extractedContent.split(/\s+/).length,
                        analysisMethod: 'gemini-1.5-flash',
                        extractionMethod: 'cheerio-web-scraping'
                    }
                },
                metadata: {
                    processingTime,
                    modelsUsed: ['gemini-1.5-flash'],
                    timestamp: new Date()
                },
                extractedContent: extractedContent.substring(0, 1000) + (extractedContent.length > 1000 ? '...' : '')
            };

            return result;
        } catch (error) {
            console.error('Error analyzing URL:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to analyze URL content');
        }
    }

    /**
     * Extract text content from a web page
     */
    private async extractContentFromUrl(url: string): Promise<string> {
        try {
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);

            // Remove script and style elements
            $('script, style, nav, header, footer, aside, .advertisement, .ads').remove();

            // Try to find main content areas
            let content = '';

            // Look for common content selectors
            const contentSelectors = [
                'article',
                '[role="main"]',
                '.content',
                '.post-content',
                '.entry-content',
                '.article-content',
                'main',
                '.main-content'
            ];

            for (const selector of contentSelectors) {
                const element = $(selector);
                if (element.length > 0) {
                    content = element.text().trim();
                    if (content.length > 200) break;
                }
            }

            // Fallback to body content if no specific content area found
            if (!content || content.length < 200) {
                content = $('body').text().trim();
            }

            // Clean up the content
            content = content
                .replace(/\s+/g, ' ')
                .replace(/\n+/g, '\n')
                .trim();

            return content;
        } catch (error) {
            console.error('Error extracting content from URL:', error);
            throw new Error('Failed to extract content from URL');
        }
    }

    /**
     * Validate input text
     */
    validateTextInput(text: string): { isValid: boolean; error?: string } {
        if (!text || typeof text !== 'string') {
            return { isValid: false, error: 'Text input is required' };
        }

        if (text.trim().length < 10) {
            return { isValid: false, error: 'Text must be at least 10 characters long' };
        }

        if (text.length > 50000) {
            return { isValid: false, error: 'Text must be less than 50,000 characters' };
        }

        return { isValid: true };
    }

    /**
     * Validate URL input
     */
    validateUrlInput(url: string): { isValid: boolean; error?: string } {
        if (!url || typeof url !== 'string') {
            return { isValid: false, error: 'URL is required' };
        }

        try {
            const urlObj = new URL(url);
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return { isValid: false, error: 'Only HTTP and HTTPS URLs are supported' };
            }
            return { isValid: true };
        } catch {
            return { isValid: false, error: 'Invalid URL format' };
        }
    }
}

export const textAnalysisService = new TextAnalysisService();