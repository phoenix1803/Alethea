'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    acceptedTypes: string[];
    maxSize: number;
    disabled?: boolean;
}

export default function FileUpload({ onFileSelect, acceptedTypes, maxSize, disabled }: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileSelection(files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (disabled) return;

        const files = e.target.files;
        if (files && files[0]) {
            handleFileSelection(files[0]);
        }
    };

    const handleFileSelection = (file: File) => {
        // Validate file type
        if (!acceptedTypes.includes(file.type)) {
            alert(`Unsupported file type. Please select: ${acceptedTypes.join(', ')}`);
            return;
        }

        // Validate file size
        if (file.size > maxSize) {
            const maxSizeMB = Math.round(maxSize / (1024 * 1024));
            alert(`File too large. Maximum size is ${maxSizeMB}MB.`);
            return;
        }

        onFileSelect(file);
    };

    const onButtonClick = () => {
        if (disabled) return;
        inputRef.current?.click();
    };

    const formatFileTypes = () => {
        return acceptedTypes
            .map(type => type.split('/')[1].toUpperCase())
            .join(', ');
    };

    const formatMaxSize = () => {
        const sizeMB = Math.round(maxSize / (1024 * 1024));
        return `${sizeMB}MB`;
    };

    return (
        <div className="w-full">
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                    ? 'border-white bg-gray-800'
                    : 'border-gray-600 hover:border-gray-500'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={acceptedTypes.join(',')}
                    onChange={handleChange}
                    disabled={disabled}
                />

                <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl text-white font-bold">+</span>
                    </div>
                    <div>
                        <p className="text-lg font-medium text-white">
                            {dragActive ? 'Drop file here' : 'Drop file here or click to browse'}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            Supported formats: {formatFileTypes()}
                        </p>
                        <p className="text-sm text-gray-400">
                            Maximum size: {formatMaxSize()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}