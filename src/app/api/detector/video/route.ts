import { NextRequest, NextResponse } from 'next/server';
import { videoAnalysisService } from '@/lib/videoAnalysis';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('video') as File;

        if (!file) {
            return NextResponse.json(
                { error: { code: 'MISSING_FILE', message: 'Video file is required' } },
                { status: 400 }
            );
        }

        // Validate video
        const validation = videoAnalysisService.validateVideo(file);
        if (!validation.isValid) {
            return NextResponse.json(
                { error: { code: 'INVALID_VIDEO', message: validation.error } },
                { status: 400 }
            );
        }

        // Analyze video
        const result = await videoAnalysisService.analyzeVideo(file);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Video detection API error:', error);

        return NextResponse.json(
            {
                error: {
                    code: 'ANALYSIS_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to analyze video',
                    details: error instanceof Error ? error.stack : undefined
                }
            },
            { status: 500 }
        );
    }
}

// Increase timeout for video processing
export const maxDuration = 300; // 5 minutes