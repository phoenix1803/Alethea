import { ffmpegService } from './ffmpeg';
import { huggingFaceService } from './huggingface';
import { whisperService } from './whisper';
import { geminiService } from './gemini';
import { DetectionResult, VideoAnalysis } from '@/types';

export class VideoAnalysisService {
    /**
     * Comprehensive video analysis
     */
    async analyzeVideo(videoFile: File): Promise<DetectionResult> {
        const startTime = Date.now();

        try {
            // Initialize FFmpeg
            await ffmpegService.initialize();

            // Extract frames and audio
            const [frames, audioBlob, metadata] = await Promise.all([
                ffmpegService.extractFrames(videoFile, 5),
                ffmpegService.extractAudio(videoFile),
                ffmpegService.getVideoMetadata(videoFile)
            ]);

            // Analyze frames for deepfakes
            const frameAnalysis = await this.analyzeFrames(frames);

            // Analyze audio
            const audioAnalysis = await this.analyzeAudio(audioBlob);

            // Calculate overall authenticity score
            const deepfakeScore = (1 - frameAnalysis.overallScore) * 100;
            const voiceScore = (1 - audioAnalysis.voiceSpoofing.probability) * 100;
            const overallScore = Math.round((deepfakeScore + voiceScore) / 2);

            let classification: 'authentic' | 'suspicious' | 'fake';
            if (overallScore >= 70) classification = 'authentic';
            else if (overallScore >= 40) classification = 'suspicious';
            else classification = 'fake';

            // Compile indicators
            const indicators = [
                ...frameAnalysis.faceAnalysis.flatMap(f => f.probability > 0.5 ? [`Deepfake detected at ${f.timestamp}s`] : []),
                ...audioAnalysis.voiceSpoofing.indicators,
                ...audioAnalysis.factCheck.claims.filter(c => c.veracity === 'false').map(c => `False claim: ${c.text}`)
            ];

            const videoAnalysis: VideoAnalysis = {
                deepfake: frameAnalysis,
                audio: audioAnalysis
            };

            const processingTime = Date.now() - startTime;

            const result: DetectionResult = {
                contentType: 'video',
                authenticity: {
                    score: overallScore,
                    classification,
                    confidence: Math.min(85, Math.max(55, overallScore))
                },
                analysis: {
                    indicators,
                    reasoning: `Video analysis completed. Deepfake probability: ${(frameAnalysis.overallScore * 100).toFixed(1)}%, Voice spoofing probability: ${(audioAnalysis.voiceSpoofing.probability * 100).toFixed(1)}%`,
                    technicalDetails: {
                        videoAnalysis,
                        fileSize: videoFile.size,
                        fileName: videoFile.name,
                        fileType: videoFile.type,
                        metadata
                    }
                },
                metadata: {
                    processingTime,
                    modelsUsed: ['ffmpeg', 'huggingface-deepfake', 'whisper-1', 'gemini-1.5-flash'],
                    timestamp: new Date()
                }
            };

            return result;
        } catch (error) {
            console.error('Error analyzing video:', error);
            throw new Error('Failed to analyze video content');
        }
    }

    /**
     * Analyze video frames for deepfakes
     */
    private async analyzeFrames(frames: Blob[]): Promise<VideoAnalysis['deepfake']> {
        try {
            const frameAnalysisPromises = frames.map(async (frame, index) => {
                const timestamp = index * 2; // Assuming 2-second intervals

                try {
                    const deepfakeResult = await huggingFaceService.detectDeepfake(frame);
                    return {
                        timestamp,
                        probability: deepfakeResult.probability,
                        boundingBox: deepfakeResult.boundingBox || { x: 0, y: 0, width: 100, height: 100 }
                    };
                } catch (error) {
                    console.error(`Error analyzing frame ${index}:`, error);
                    return {
                        timestamp,
                        probability: 0.5,
                        boundingBox: { x: 0, y: 0, width: 100, height: 100 }
                    };
                }
            });

            const faceAnalysis = await Promise.all(frameAnalysisPromises);
            const overallScore = faceAnalysis.reduce((sum, frame) => sum + frame.probability, 0) / faceAnalysis.length;

            return {
                faceAnalysis,
                overallScore
            };
        } catch (error) {
            console.error('Error analyzing frames:', error);
            return {
                faceAnalysis: [],
                overallScore: 0.5
            };
        }
    }

    /**
     * Analyze audio from video
     */
    private async analyzeAudio(audioBlob: Blob): Promise<VideoAnalysis['audio']> {
        try {
            // Transcribe audio
            const transcription = await whisperService.transcribeAudio(audioBlob);

            // Detect voice spoofing
            const voiceSpoofing = await whisperService.detectVoiceSpoofing(audioBlob);

            // Fact-check transcript
            const factCheck = await this.factCheckTranscript(transcription.transcript);

            return {
                voiceSpoofing,
                transcript: transcription.transcript,
                factCheck
            };
        } catch (error) {
            console.error('Error analyzing audio:', error);
            return {
                voiceSpoofing: {
                    probability: 0.5,
                    indicators: ['Audio analysis failed']
                },
                transcript: 'Unable to transcribe audio',
                factCheck: {
                    claims: []
                }
            };
        }
    }

    /**
     * Fact-check transcript content
     */
    private async factCheckTranscript(transcript: string): Promise<VideoAnalysis['audio']['factCheck']> {
        if (!transcript || transcript.length < 20) {
            return { claims: [] };
        }

        try {
            // Use Gemini to identify and fact-check claims
            const analysis = await geminiService.analyzeTextAuthenticity(transcript);

            // Extract potential false claims from the analysis
            const claims = analysis.indicators
                .filter(indicator => indicator.toLowerCase().includes('false') || indicator.toLowerCase().includes('misleading'))
                .map(indicator => ({
                    text: indicator,
                    veracity: 'false' as const,
                    sources: ['AI Analysis']
                }));

            return { claims };
        } catch (error) {
            console.error('Error fact-checking transcript:', error);
            return { claims: [] };
        }
    }

    /**
     * Validate video file
     */
    validateVideo(file: File): { isValid: boolean; error?: string } {
        const maxSize = 100 * 1024 * 1024; // 100MB
        const allowedTypes = [
            'video/mp4',
            'video/webm',
            'video/ogg',
            'video/avi',
            'video/mov',
            'video/quicktime'
        ];

        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                error: 'Unsupported video format. Please use MP4, WebM, OGG, AVI, or MOV.'
            };
        }

        if (file.size > maxSize) {
            return {
                isValid: false,
                error: 'Video file too large. Maximum size is 100MB.'
            };
        }

        return { isValid: true };
    }
}

export const videoAnalysisService = new VideoAnalysisService();