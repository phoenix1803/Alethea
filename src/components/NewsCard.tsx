interface NewsCardProps {
    title: string;
    summary: string;
    url: string;
    source: string;
    publishedAt: string;
}

export default function NewsCard({ title, summary, url, source, publishedAt }: NewsCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1 mr-4">
                    {title}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(publishedAt)}
                </span>
            </div>

            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                {summary}
            </p>

            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                    {source}
                </span>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white hover:text-gray-300 transition-colors font-medium"
                >
                    Read Full Article →
                </a>
            </div>
        </div>
    );
}