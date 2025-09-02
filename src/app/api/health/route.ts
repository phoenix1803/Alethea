import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
            gemini: process.env.GEMINI_API_KEY ? 'configured' : 'not configured',
            huggingface: process.env.HUGGINGFACE_API_KEY ? 'configured' : 'not configured',
            openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
            newsapi: process.env.NEWS_API_KEY ? 'configured' : 'not configured',
        }
    });
}