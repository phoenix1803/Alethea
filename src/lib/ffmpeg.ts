import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export class FFmpegService {
    private ffmpeg: FFmpeg | null = null;
    private isLoaded = false;

    /**
     * Initialize FFmpeg
     */
    async initialize(): Promise<void> {
        if (this.isLoaded) return;

        try {
            this.ffmpeg = new FFmpeg();

            // Load FFmpeg core
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            await this.ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            this.isLoaded = true;
        } catch (error) {
            console.error('Failed to initialize FFmpeg:', error);
            throw new Error('Failed to initialize media processing');
        }
    }

    /**
     * Extract frames from video
     */
    async extractFrames(videoFile: File, frameCount: number = 5): Promise<Blob[]> {
        if (!this.ffmpeg || !this.isLoaded) {
            await this.initialize();
        }

        if (!this.ffmpeg) {
            throw new Error('FFmpeg not initialized');
        }

        try {
            const inputName = 'input.mp4';
            await this.ffmpeg.writeFile(inputName, await fetchFile(videoFile));

            // Get video duration first
            await this.ffmpeg.exec(['-i', inputName, '-f', 'null', '-']);

            const frames: Blob[] = [];

            // Extract frames at regular intervals
            for (let i = 0; i < frameCount; i++) {
                const outputName = `frame_${i}.jpg`;
                const seekTime = (i / (frameCount - 1)) * 100; // Percentage of video

                await this.ffmpeg.exec([
                    '-i', inputName,
                    '-ss', `${seekTime}%`,
                    '-vframes', '1',
                    '-q:v', '2',
                    outputName
                ]);

                const data = await this.ffmpeg.readFile(outputName);
                // Convert FileData to Blob - bypass TypeScript compatibility issues
                frames.push(new Blob([data as any], { type: 'image/jpeg' }));
            }

            return frames;
        } catch (error) {
            console.error('Error extracting frames:', error);
            throw new Error('Failed to extract video frames');
        }
    }

    /**
     * Extract audio from video
     */
    async extractAudio(videoFile: File): Promise<Blob> {
        if (!this.ffmpeg || !this.isLoaded) {
            await this.initialize();
        }

        if (!this.ffmpeg) {
            throw new Error('FFmpeg not initialized');
        }

        try {
            const inputName = 'input.mp4';
            const outputName = 'audio.wav';

            await this.ffmpeg.writeFile(inputName, await fetchFile(videoFile));

            await this.ffmpeg.exec([
                '-i', inputName,
                '-vn', // No video
                '-acodec', 'pcm_s16le',
                '-ar', '16000', // 16kHz sample rate for Whisper
                '-ac', '1', // Mono
                outputName
            ]);

            const data = await this.ffmpeg.readFile(outputName);
            return new Blob([data as any], { type: 'audio/wav' });
        } catch (error) {
            console.error('Error extracting audio:', error);
            throw new Error('Failed to extract audio from video');
        }
    }

    /**
     * Get video metadata
     */
    async getVideoMetadata(videoFile: File): Promise<{
        duration: number;
        width: number;
        height: number;
        fps: number;
        size: number;
    }> {
        if (!this.ffmpeg || !this.isLoaded) {
            await this.initialize();
        }

        if (!this.ffmpeg) {
            throw new Error('FFmpeg not initialized');
        }

        try {
            const inputName = 'input.mp4';
            await this.ffmpeg.writeFile(inputName, await fetchFile(videoFile));

            // This is a simplified metadata extraction
            // In a real implementation, you'd parse ffprobe output
            return {
                duration: 0, // Would be extracted from ffprobe
                width: 1920, // Default values - would be extracted
                height: 1080,
                fps: 30,
                size: videoFile.size
            };
        } catch (error) {
            console.error('Error getting video metadata:', error);
            throw new Error('Failed to get video metadata');
        }
    }
}

export const ffmpegService = new FFmpegService();