import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    private initializeClient() {
        if (!this.genAI) {
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY environment variable is required');
            }
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        }
        return this.model;
    }

    /**
     * Summarize news article content
     */
    async summarizeArticle(content: string, maxWords: number = 50): Promise<string> {
        try {
            const model = this.initializeClient();
            const prompt = `Summarize the following news article in approximately ${maxWords} words. Focus on the key facts and main points:\n\n${content}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error('Error summarizing article:', error);
            throw new Error('Failed to summarize article');
        }
    }

    /**
     * Analyze text for misinformation and AI generation
     */
    async analyzeTextAuthenticity(text: string): Promise<{
        score: number;
        classification: 'authentic' | 'suspicious' | 'fake';
        confidence: number;
        indicators: string[];
        reasoning: string;
    }> {
        try {
            const model = this.initializeClient();
            const prompt = `Analyze the following text for authenticity, misinformation, and AI generation indicators. 
      
Provide your analysis in the following JSON format:
{
  "score": <number 0-100, where 100 is completely authentic>,
  "classification": "<authentic|suspicious|fake>",
  "confidence": <number 0-100 representing confidence in the assessment>,
  "indicators": ["<list of specific indicators found>"],
  "reasoning": "<detailed explanation of the analysis>"
}

Text to analyze:
${text}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const analysisText = response.text().trim();

            // Parse JSON response
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid response format from Gemini');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Error analyzing text authenticity:', error);
            throw new Error('Failed to analyze text authenticity');
        }
    }

    /**
     * Extract and analyze content from URL
     */
    async analyzeUrlContent(url: string): Promise<{
        extractedContent: string;
        analysis: {
            score: number;
            classification: 'authentic' | 'suspicious' | 'fake';
            confidence: number;
            indicators: string[];
            reasoning: string;
        };
    }> {
        try {
            const model = this.initializeClient();
            // Note: In a real implementation, you'd want to fetch the URL content
            // For now, we'll provide a placeholder that can be extended
            const prompt = `Analyze the content from this URL for authenticity and misinformation: ${url}
      
Note: This is a placeholder implementation. In production, the actual content would be fetched and analyzed.

Provide analysis in JSON format:
{
  "extractedContent": "<summary of what would be extracted>",
  "analysis": {
    "score": <number 0-100>,
    "classification": "<authentic|suspicious|fake>",
    "confidence": <number 0-100>,
    "indicators": ["<list of indicators>"],
    "reasoning": "<detailed explanation>"
  }
}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const analysisText = response.text().trim();

            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid response format from Gemini');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Error analyzing URL content:', error);
            throw new Error('Failed to analyze URL content');
        }
    }

    /**
     * Generate reasoning and explanations for detection results
     */
    async generateExplanation(
        contentType: 'text' | 'image' | 'video',
        indicators: string[],
        technicalDetails: Record<string, any>
    ): Promise<string> {
        try {
            const model = this.initializeClient();
            const prompt = `Generate a clear, detailed explanation for content authenticity analysis results.

Content Type: ${contentType}
Indicators Found: ${indicators.join(', ')}
Technical Details: ${JSON.stringify(technicalDetails, null, 2)}

Provide a user-friendly explanation that:
1. Explains what was analyzed
2. Describes the key indicators found
3. Explains the significance of these indicators
4. Provides context about the detection methods used
5. Offers guidance on interpreting the results`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error('Error generating explanation:', error);
            throw new Error('Failed to generate explanation');
        }
    }
}

// Export singleton instance
export const geminiService = new GeminiService();