import { NextRequest, NextResponse } from 'next/server';
import { textAnalysisService } from '@/lib/textAnalysis';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, url, type = 'text' } = body;

        // Validate input
        if (type === 'url') {
            if (!url) {
                return NextResponse.json(
                    { error: { code: 'MISSING_URL', message: 'URL is required for URL analysis' } },
                    { status: 400 }
                );
            }

            const urlValidation = textAnalysisService.validateUrlInput(url);
            if (!urlValidation.isValid) {
                return NextResponse.json(
                    { error: { code: 'INVALID_URL', message: urlValidation.error } },
                    { status: 400 }
                );
            }

            // Analyze URL content
            const result = await textAnalysisService.analyzeUrl(url);
            return NextResponse.json(result);
        } else {
            if (!text) {
                return NextResponse.json(
                    { error: { code: 'MISSING_TEXT', message: 'Text content is required' } },
                    { status: 400 }
                );
            }

            const textValidation = textAnalysisService.validateTextInput(text);
            if (!textValidation.isValid) {
                return NextResponse.json(
                    { error: { code: 'INVALID_TEXT', message: textValidation.error } },
                    { status: 400 }
                );
            }

            // Analyze text content
            const result = await textAnalysisService.analyzeText(text);
            return NextResponse.json(result);
        }
    } catch (error) {
        console.error('Text detection API error:', error);

        return NextResponse.json(
            {
                error: {
                    code: 'ANALYSIS_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to analyze content',
                    details: error instanceof Error ? error.stack : undefined
                }
            },
            { status: 500 }
        );
    }
}