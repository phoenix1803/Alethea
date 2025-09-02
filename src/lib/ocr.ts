import sharp from 'sharp';
import { geminiService } from './gemini';

export class OCRService {
    /**
     * Extract text from image using Gemini Vision
     */
    async extractText(imageBlob: Blob): Promise<string> {
        try {
            // Convert blob to base64 for Gemini
            const arrayBuffer = await imageBlob.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');

            // Use Gemini for OCR (this is a simplified implementation)
            // In practice, you'd use Gemini's vision capabilities
            const prompt = `Extract all text content from this image. Return only the text, no additional commentary.`;

            // This is a placeholder - actual Gemini Vision API call would be different
            const extractedText = await this.mockOCRExtraction(base64);

            return extractedText;
        } catch (error) {
            console.error('Error extracting text from image:', error);
            throw new Error('Failed to extract text from image');
        }
    }

    /**
     * Get image metadata using Sharp
     */
    async getImageMetadata(imageBlob: Blob): Promise<{
        width: number;
        height: number;
        format: string;
        size: number;
        exifData: Record<string, any>;
    }> {
        try {
            const arrayBuffer = await imageBlob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const metadata = await sharp(buffer).metadata();

            return {
                width: metadata.width || 0,
                height: metadata.height || 0,
                format: metadata.format || 'unknown',
                size: buffer.length,
                exifData: metadata.exif ? this.parseExifData(metadata.exif) : {}
            };
        } catch (error) {
            console.error('Error getting image metadata:', error);
            throw new Error('Failed to get image metadata');
        }
    }

    /**
     * Preprocess image for analysis
     */
    async preprocessImage(imageBlob: Blob): Promise<Blob> {
        try {
            const arrayBuffer = await imageBlob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Resize and optimize image for analysis
            const processedBuffer = await sharp(buffer)
                .resize(1024, 1024, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 90 })
                .toBuffer();

            return new Blob([processedBuffer as any], { type: 'image/jpeg' });
        } catch (error) {
            console.error('Error preprocessing image:', error);
            throw new Error('Failed to preprocess image');
        }
    }

    /**
     * Mock OCR extraction (placeholder for actual implementation)
     */
    private async mockOCRExtraction(base64Image: string): Promise<string> {
        // This is a placeholder implementation
        // In a real app, you'd use Gemini Vision API or another OCR service

        // Simulate OCR processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Return mock extracted text
        return 'Sample extracted text from image';
    }

    /**
     * Parse EXIF data from image
     */
    private parseExifData(exifBuffer: Buffer): Record<string, any> {
        try {
            // This is a simplified EXIF parser
            // In practice, you'd use a proper EXIF parsing library
            return {
                timestamp: new Date().toISOString(),
                camera: 'Unknown',
                software: 'Unknown',
                gps: null
            };
        } catch (error) {
            console.error('Error parsing EXIF data:', error);
            return {};
        }
    }

    /**
     * Validate image file
     */
    validateImage(file: File): { isValid: boolean; error?: string } {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                error: 'Unsupported image format. Please use JPEG, PNG, WebP, or GIF.'
            };
        }

        if (file.size > maxSize) {
            return {
                isValid: false,
                error: 'Image file too large. Maximum size is 10MB.'
            };
        }

        return { isValid: true };
    }
}

export const ocrService = new OCRService();