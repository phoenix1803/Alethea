import { NextRequest, NextResponse } from 'next/server';
import { huggingFaceService } from '@/lib/huggingface';
import { ocrService } from '@/lib/ocr';
import { DetectionResult, ImageAnalysis } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json(
                { error: { code: 'MISSING_FILE', message: 'Image file is required' } },
                { status: 400 }
            );
        }

        // Validate image
        const validation = ocrService.validateImage(file);
        if (!validation.isValid) {
            return NextResponse.json(
                { error: { code: 'INVALID_IMAGE', message: validation.error } },
                { status: 400 }
            );
        }

        const startTime = Date.now();

        // Convert file to blob
        const imageBlob = new Blob([await file.arrayBuffer()], { type: file.type });

        // Preprocess image
        const processedImage = await ocrService.preprocessImage(imageBlob);

        // Run parallel analysis
        const [
            aiDetection,
            deepfakeDetection,
            manipulationDetection,
            metadata,
            ocrText
        ] = await Promise.allSettled([
            huggingFaceService.detectAIImage(processedImage),
            huggingFaceService.detectDeepfake(processedImage),
            huggingFaceService.detectManipulation(processedImage),
            ocrService.getImageMetadata(imageBlob),
            ocrService.extractText(processedImage)
        ]);

        // Process results
        const aiResult = aiDetection.status === 'fulfilled' ? aiDetection.value : { probability: 0.5, indicators: ['Analysis failed'] };
        const deepfakeResult = deepfakeDetection.status === 'fulfilled' ? deepfakeDetection.value : { probability: 0.5, indicators: ['Analysis failed'] };
        const manipulationResult = manipulationDetection.status === 'fulfilled' ? manipulationDetection.value : { detected: false, techniques: [] };
        const metadataResult = metadata.status === 'fulfilled' ? metadata.value : { width: 0, height: 0, format: 'unknown', size: file.size, exifData: {} };
        const ocrResult = ocrText.status === 'fulfilled' ? ocrText.value : '';

        // Calculate overall authenticity score
        const aiScore = (1 - aiResult.probability) * 100;
        const deepfakeScore = (1 - deepfakeResult.probability) * 100;
        const manipulationScore = manipulationResult.detected ? 20 : 80;

        const overallScore = Math.round((aiScore + deepfakeScore + manipulationScore) / 3);

        let classification: 'authentic' | 'suspicious' | 'fake';
        if (overallScore >= 70) classification = 'authentic';
        else if (overallScore >= 40) classification = 'suspicious';
        else classification = 'fake';

        // Compile indicators
        const indicators = [
            ...aiResult.indicators,
            ...deepfakeResult.indicators,
            ...manipulationResult.techniques.map(t => `Manipulation: ${t}`)
        ];

        const imageAnalysis: ImageAnalysis = {
            aiGenerated: {
                probability: aiResult.probability,
                indicators: aiResult.indicators
            },
            manipulation: {
                detected: manipulationResult.detected,
                techniques: manipulationResult.techniques,
                regions: manipulationResult.regions
            },
            metadata: {
                exifData: metadataResult.exifData,
                dimensions: {
                    width: metadataResult.width,
                    height: metadataResult.height
                }
            },
            ocrText: ocrResult
        };

        const processingTime = Date.now() - startTime;

        const result: DetectionResult = {
            contentType: 'image',
            authenticity: {
                score: overallScore,
                classification,
                confidence: Math.min(90, Math.max(60, overallScore))
            },
            analysis: {
                indicators,
                reasoning: `Image analysis completed. AI generation probability: ${(aiResult.probability * 100).toFixed(1)}%, Deepfake probability: ${(deepfakeResult.probability * 100).toFixed(1)}%, Manipulation detected: ${manipulationResult.detected ? 'Yes' : 'No'}`,
                technicalDetails: {
                    imageAnalysis,
                    fileSize: file.size,
                    fileName: file.name,
                    fileType: file.type
                }
            },
            metadata: {
                processingTime,
                modelsUsed: ['huggingface-ai-detector', 'huggingface-deepfake-detector', 'sharp-metadata'],
                timestamp: new Date()
            }
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Image detection API error:', error);

        return NextResponse.json(
            {
                error: {
                    code: 'ANALYSIS_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to analyze image',
                    details: error instanceof Error ? error.stack : undefined
                }
            },
            { status: 500 }
        );
    }
}