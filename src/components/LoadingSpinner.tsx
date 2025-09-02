interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'w-4 h-4';
            case 'lg':
                return 'w-8 h-8';
            default:
                return 'w-6 h-6';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-2">
            <div className={`animate-spin rounded-full border-2 border-gray-600 border-t-white ${getSizeClasses()}`} />
            {text && (
                <p className="text-sm text-gray-400">{text}</p>
            )}
        </div>
    );
}