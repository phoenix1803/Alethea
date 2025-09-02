'use client';

import { useState } from 'react';
import { DetectionResult } from '@/types';
import ConfidenceScore from './ConfidenceScore';

interface DetectorResultProps {
    result: DetectionResult;
}

export default function DetectorResult({ result }: DetectorResultProps) {
    const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

    const formatProcessingTime = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };

    const formatTimestamp = (date: Date) => {
        return new Date(date).toLocaleString();
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Analysis Results</h3>
                    <p className="text-gray-400 text-sm">
                        Content Type: {result.contentType.toUpperCase()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">
                        Processed in {formatProcessingTime(result.metadata.processingTime)}
                    </p>
                    <p className="text-xs text-gray-500">
                        {formatTimestamp(result.metadata.timestamp)}
                    </p>
                </div>
            </div>

            {/* Confidence Score */}
            <div>
                <h4 className="text-lg font-semibold text-white mb-3">Authenticity Assessment</h4>
                <ConfidenceScore
                    score={result.authenticity.score}
                    classification={result.authenticity.classification}
                    size="lg"
                />
                <p className="text-sm text-gray-400 mt-2">
                    Confidence: {result.authenticity.confidence}%
                </p>
            </div>

            {/* Analysis Reasoning */}
            <div>
                <h4 className="text-lg font-semibold text-white mb-3">Analysis Summary</h4>
                <p className="text-gray-300 leading-relaxed">
                    {result.analysis.reasoning}
                </p>
            </div>

            {/* Indicators */}
            {result.analysis.indicators.length > 0 && (
                <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Key Indicators</h4>
                    <ul className="space-y-2">
                        {result.analysis.indicators.map((indicator, index) => (
                            <li key={index} className="flex items-start space-x-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <span className="text-gray-300">{indicator}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Models Used */}
            <div>
                <h4 className="text-lg font-semibold text-white mb-3">AI Models Used</h4>
                <div className="flex flex-wrap gap-2">
                    {result.metadata.modelsUsed.map((model, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300"
                        >
                            {model}
                        </span>
                    ))}
                </div>
            </div>

            {/* Technical Details Toggle */}
            <div>
                <button
                    onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                    <span>{showTechnicalDetails ? '▼' : '▶'}</span>
                    <span>Technical Details</span>
                </button>

                {showTechnicalDetails && (
                    <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                        <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(result.analysis.technicalDetails, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            {/* Content Type Specific Details */}
            {result.contentType === 'text' && 'extractedContent' in result && (
                <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Extracted Content</h4>
                    <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {(result as any).extractedContent}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}