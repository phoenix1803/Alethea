interface ConfidenceScoreProps {
    score: number; // 0-100
    classification: 'authentic' | 'suspicious' | 'fake';
    size?: 'sm' | 'md' | 'lg';
}

export default function ConfidenceScore({
    score,
    classification,
    size = 'md'
}: ConfidenceScoreProps) {
    const getColorClasses = () => {
        switch (classification) {
            case 'authentic':
                return 'text-green-700 bg-green-100 border-green-200';
            case 'suspicious':
                return 'text-yellow-700 bg-yellow-100 border-yellow-200';
            case 'fake':
                return 'text-red-700 bg-red-100 border-red-200';
            default:
                return 'text-gray-700 bg-gray-100 border-gray-200';
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'text-sm px-2 py-1';
            case 'lg':
                return 'text-lg px-4 py-3';
            default:
                return 'text-base px-3 py-2';
        }
    };

    const getProgressColor = () => {
        switch (classification) {
            case 'authentic':
                return 'bg-green-500';
            case 'suspicious':
                return 'bg-yellow-500';
            case 'fake':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-2">
            <div className={`inline-flex items-center rounded-full border ${getColorClasses()} ${getSizeClasses()}`}>
                <span className="font-semibold capitalize">{classification}</span>
                <span className="ml-2 font-mono">{score}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}