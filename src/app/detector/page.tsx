'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import FileUpload from '@/components/FileUpload';
import DetectorResult from '@/components/DetectorResult';
import LoadingSpinner from '@/components/LoadingSpinner';
import { DetectionResult } from '@/types';

type AnalysisType = 'text' | 'url' | 'image' | 'video';

export default function DetectorPage() {
    const [activeTab, setActiveTab] = useState<AnalysisType>('text');
    const [textInput, setTextInput] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DetectionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const tabs = [
        { id: 'text' as const, label: 'Text Analysis', description: 'Analyze text content for misinformation' },
        { id: 'url' as const, label: 'URL Analysis', description: 'Extract and analyze content from web pages' },
        { id: 'image' as const, label: 'Image Analysis', description: 'Detect AI generation and manipulation' },
        { id: 'video' as const, label: 'Video Analysis', description: 'Detect deepfakes and voice spoofing' },
    ];

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            let response: Response;

            if (activeTab === 'text') {
                if (!textInput.trim()) {
                    throw new Error('Please enter text to analyze');
                }

                response = await fetch('/api/detector/text', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: textInput, type: 'text' }),
                });
            } else if (activeTab === 'url') {
                if (!urlInput.trim()) {
                    throw new Error('Please enter a URL to analyze');
                }

                response = await fetch('/api/detector/text', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: urlInput, type: 'url' }),
                });
            } else if (activeTab === 'image') {
                if (!selectedFile) {
                    throw new Error('Please select an image file');
                }

                const formData = new FormData();
                formData.append('image', selectedFile);

                response = await fetch('/api/detector/image', {
                    method: 'POST',
                    body: formData,
                });
            } else if (activeTab === 'video') {
                if (!selectedFile) {
                    throw new Error('Please select a video file');
                }

                const formData = new FormData();
                formData.append('video', selectedFile);

                response = await fetch('/api/detector/video', {
                    method: 'POST',
                    body: formData,
                });
            } else {
                throw new Error('Invalid analysis type');
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Analysis failed');
            }

            const data: DetectionResult = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getFileUploadConfig = () => {
        if (activeTab === 'image') {
            return {
                acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                maxSize: 10 * 1024 * 1024, // 10MB
            };
        } else if (activeTab === 'video') {
            return {
                acceptedTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
                maxSize: 100 * 1024 * 1024, // 100MB
            };
        }
        return { acceptedTypes: [], maxSize: 0 };
    };

    const resetForm = () => {
        setTextInput('');
        setUrlInput('');
        setSelectedFile(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-4">Content Detector</h1>
                    <p className="text-gray-400 mb-8">
                        Analyze text, images, and videos for authenticity using advanced AI models
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="border-b border-gray-800">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        resetForm();
                                    }}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-white text-white'
                                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                        {tabs.find(tab => tab.id === activeTab)?.description}
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                {activeTab === 'text' && 'Enter Text Content'}
                                {activeTab === 'url' && 'Enter URL'}
                                {activeTab === 'image' && 'Upload Image'}
                                {activeTab === 'video' && 'Upload Video'}
                            </h3>

                            {activeTab === 'text' && (
                                <textarea
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Paste text content here for analysis..."
                                    className="w-full h-40 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white resize-none"
                                    disabled={loading}
                                />
                            )}

                            {activeTab === 'url' && (
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="https://example.com/article"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white"
                                    disabled={loading}
                                />
                            )}

                            {(activeTab === 'image' || activeTab === 'video') && (
                                <div>
                                    <FileUpload
                                        onFileSelect={setSelectedFile}
                                        {...getFileUploadConfig()}
                                        disabled={loading}
                                    />
                                    {selectedFile && (
                                        <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded-lg">
                                            <p className="text-sm text-gray-300">
                                                Selected: {selectedFile.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleAnalyze}
                                disabled={loading || (
                                    (activeTab === 'text' && !textInput.trim()) ||
                                    (activeTab === 'url' && !urlInput.trim()) ||
                                    ((activeTab === 'image' || activeTab === 'video') && !selectedFile)
                                )}
                                className="w-full mt-4 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 transition-colors font-medium"
                            >
                                {loading ? 'Analyzing...' : 'Analyze Content'}
                            </button>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div>
                        {loading && (
                            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12">
                                <LoadingSpinner
                                    size="lg"
                                    text={`Analyzing ${activeTab} content...`}
                                />
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-900 border border-red-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-red-200 mb-2">Analysis Error</h3>
                                <p className="text-red-300">{error}</p>
                            </div>
                        )}

                        {result && !loading && (
                            <DetectorResult result={result} />
                        )}

                        {!result && !loading && !error && (
                            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                                <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl text-white font-bold">?</span>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Ready to Analyze</h3>
                                <p className="text-gray-400">
                                    Select content to analyze and click "Analyze Content" to get started.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}