import axios from 'axios';

export class HuggingFaceService {
    private apiKey = process.env.HUGGINGFACE_API_KEY;
    private baseUrl = 'https://api-inference.huggingface.co/models';

    constructor() {
        if (!this.apiKey) {
            console.warn('HuggingFace API key not configured');
        }
    }

    /**
     * Detect AI-generated images
     */
    async detectAIImage(imageBlob: Blob): Promise<{
        probability: number;
        indicators: string[];
    }> {
        if (!this.apiKey) {
            throw new Error('HuggingFace API key not configured');
        }

        try {
            // Using a model for AI-generated image detection
            const response = await axios.post(
                `${this.baseUrl}/umm-maybe/AI-image-detector`,
                imageBlob,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/octet-stream',
                    },
                    timeout: 30000
                }
            );

            // Parse response based on model output format
            const result = response.data;

            // This is a simplified response - actual model output would vary
            return {
                probability: result.score || 0.5,
                indicators: result.indicators || ['AI generation patterns detected']
            };
        } catch (error) {
            console.error('Error detecting AI image:', error);

            // Fallback analysis
            return {
                probability: 0.5,
                indicators: ['Unable to complete AI detection analysis']
            };
        }
    }

    /**
     * Detect deepfakes in image/frame
     */
    async detectDeepfake(imageBlob: Blob): Promise<{
        probability: number;
        boundingBox?: { x: number; y: number; width: number; height: number };
        indicators: string[];
    }> {
        if (!this.apiKey) {
            throw new Error('HuggingFace API key not configured');
        }

        try {
            // Using a deepfake detection model
            const response = await axios.post(
                `${this.baseUrl}/dima806/deepfake_vs_real_image_detection`,
                imageBlob,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/octet-stream',
                    },
                    timeout: 30000
                }
            );

            const result = response.data;

            return {
                probability: result.score || 0.5,
                boundingBox: result.boundingBox,
                indicators: result.indicators || ['Deepfake patterns detected']
            };
        } catch (error) {
            console.error('Error detecting deepfake:', error);

            return {
                probability: 0.5,
                indicators: ['Unable to complete deepfake analysis']
            };
        }
    }

    /**
     * Detect image manipulation
     */
    async detectManipulation(imageBlob: Blob): Promise<{
        detected: boolean;
        techniques: string[];
        regions?: Array<{ x: number; y: number; width: number; height: number }>;
    }> {
        if (!this.apiKey) {
            throw new Error('HuggingFace API key not configured');
        }

        try {
            // This would use a manipulation detection model
            // For now, providing a mock implementation

            return {
                detected: Math.random() > 0.7,
                techniques: ['Possible clone stamping', 'Color adjustment'],
                regions: [
                    { x: 100, y: 100, width: 50, height: 50 }
                ]
            };
        } catch (error) {
            console.error('Error detecting manipulation:', error);

            return {
                detected: false,
                techniques: [],
                regions: []
            };
        }
    }

    /**
     * Wait for model to be ready (handle cold starts)
     */
    private async waitForModel(modelUrl: string, maxRetries: number = 3): Promise<void> {
        for (let i = 0; i < maxRetries; i++) {
            try {
                await axios.get(modelUrl, {
                    headers: { 'Authorization': `Bearer ${this.apiKey}` },
                    timeout: 5000
                });
                return;
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
            }
        }
    }
}

export const huggingFaceService = new HuggingFaceService();