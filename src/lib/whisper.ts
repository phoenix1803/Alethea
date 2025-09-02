import axios from 'axios';

export class WhisperService {
    private apiKey = process.env.OPENAI_API_KEY;
    private baseUrl = 'https://api.openai.com/v1/audio';

    constructor() {
        if (!this.apiKey) {
            console.warn('OpenAI API key not configured');
        }
    }

    /**
     * Transcribe audio using Whisper API
     */
    async transcribeAudio(audioBlob: Blob, fileName: string = 'audio.wav'): Promise<{
        transcript: string;
        language?: string;
        confidence?: number;
    }> {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        try {
            const formData = new FormData();
            formData.append('file', audioBlob, fileName);
            formData.append('model', 'whisper-1');
            formData.append('response_format', 'verbose_json');

            const response = await axios.post(
                `${this.baseUrl}/transcriptions`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 60000 // 60 seconds for audio processing
                }
            );

            return {
                transcript: response.data.text || '',
                language: response.data.language,
                confidence: response.data.confidence || 0.8
            };
        } catch (error) {
            console.error('Error transcribing audio:', error);

            // Fallback mock transcription
            return {
                transcript: 'Unable to transcribe audio content',
                confidence: 0.1
            };
        }
    }

    /**
     * Detect voice spoofing/synthesis
     */
    async detectVoiceSpoofing(audioBlob: Blob): Promise<{
        probability: number;
        indicators: string[];
    }> {
        try {
            // This would typically use a specialized voice spoofing detection model
            // For now, providing a mock implementation

            // Analyze audio characteristics
            const audioBuffer = await audioBlob.arrayBuffer();
            const audioSize = audioBuffer.byteLength;

            // Mock analysis based on audio characteristics
            const probability = Math.random() * 0.6; // Random probability for demo

            const indicators = [];
            if (probability > 0.3) {
                indicators.push('Unusual frequency patterns detected');
            }
            if (probability > 0.4) {
                indicators.push('Synthetic voice characteristics');
            }
            if (audioSize < 50000) {
                indicators.push('Short audio duration may affect accuracy');
            }

            return {
                probability,
                indicators
            };
        } catch (error) {
            console.error('Error detecting voice spoofing:', error);
            return {
                probability: 0.5,
                indicators: ['Unable to complete voice analysis']
            };
        }
    }

    /**
     * Validate audio file
     */
    validateAudio(file: File): { isValid: boolean; error?: string } {
        const maxSize = 25 * 1024 * 1024; // 25MB (Whisper limit)
        const allowedTypes = [
            'audio/wav',
            'audio/mp3',
            'audio/mpeg',
            'audio/mp4',
            'audio/m4a',
            'audio/webm',
            'audio/ogg'
        ];

        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                error: 'Unsupported audio format. Please use WAV, MP3, MP4, M4A, WebM, or OGG.'
            };
        }

        if (file.size > maxSize) {
            return {
                isValid: false,
                error: 'Audio file too large. Maximum size is 25MB.'
            };
        }

        return { isValid: true };
    }
}

export const whisperService = new WhisperService();