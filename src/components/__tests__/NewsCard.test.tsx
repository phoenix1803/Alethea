import { render, screen } from '@testing-library/react';
import NewsCard from '../NewsCard';

describe('NewsCard', () => {
    const mockProps = {
        title: 'Test News Title',
        summary: 'This is a test summary of the news article',
        url: 'https://example.com/article',
        source: 'Test Source',
        publishedAt: '2024-01-15T10:30:00Z'
    };

    it('renders news card with all information', () => {
        render(<NewsCard {...mockProps} />);

        expect(screen.getByText('Test News Title')).toBeInTheDocument();
        expect(screen.getByText('This is a test summary of the news article')).toBeInTheDocument();
        expect(screen.getByText('Test Source')).toBeInTheDocument();
        expect(screen.getByText('Read Full Article →')).toBeInTheDocument();
    });

    it('formats date correctly', () => {
        render(<NewsCard {...mockProps} />);

        // Check that some date text is present (exact format may vary by locale)
        expect(screen.getByText(/Jan|January/)).toBeInTheDocument();
        expect(screen.getByText(/15/)).toBeInTheDocument();
        expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it('has correct external link', () => {
        render(<NewsCard {...mockProps} />);

        const link = screen.getByText('Read Full Article →').closest('a');
        expect(link).toHaveAttribute('href', 'https://example.com/article');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
});