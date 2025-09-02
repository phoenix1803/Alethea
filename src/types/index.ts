// Core data models and interfaces for Alethea Authenticity Engine

export interface NewsArticle {
    id: string;
    title: string;
    content: string;
    summary: string;
    url: string;
    source: string;
    publishedAt: Date;
    credibilityScore?: number;
}

export interface DetectionResult {
    contentType: 'text' | 'image' | 'video';
    authenticity: {
        score: number; // 0-100
        classification: 'authentic' | 'suspicious' | 'fake';
        confidence: number;
    };
    analysis: {
        indicators: string[];
        reasoning: string;
        technicalDetails: Record<string, any>;
    };
    metadata: {
        processingTime: number;
        modelsUsed: string[];
        timestamp: Date;
    };
}

export interface ImageAnalysis {
    aiGenerated: {
        probability: number;
        indicators: string[];
    };
    manipulation: {
        detected: boolean;
        techniques: string[];
        regions?: Array<{ x: number, y: number, width: number, height: number }>;
    };
    metadata: {
        exifData: Record<string, any>;
        dimensions: { width: number, height: number };
    };
    ocrText?: string;
}

export interface VideoAnalysis {
    deepfake: {
        faceAnalysis: Array<{
            timestamp: number;
            probability: number;
            boundingBox: { x: number, y: number, width: number, height: number };
        }>;
        overallScore: number;
    };
    audio: {
        voiceSpoofing: {
            probability: number;
            indicators: string[];
        };
        transcript: string;
        factCheck: {
            claims: Array<{
                text: string;
                veracity: 'true' | 'false' | 'unverified';
                sources: string[];
            }>;
        };
    };
}

// API Request/Response interfaces
export interface NewsRequest {
    query: string;
    limit?: number;
    page?: number;
}

export interface NewsResponse {
    articles: Array<{
        title: string;
        summary: string;
        url: string;
        source: string;
        publishedAt: string;
    }>;
    totalResults: number;
}

export interface APIError {
    error: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: Date;
    requestId: string;
}