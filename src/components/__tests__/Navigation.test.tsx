import { render, screen } from '@testing-library/react';
import Navigation from '../Navigation';

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

describe('Navigation', () => {
    it('renders navigation links', () => {
        render(<Navigation />);

        expect(screen.getByText('Alethea')).toBeInTheDocument();
        expect(screen.getByText('News Summarizer')).toBeInTheDocument();
        expect(screen.getByText('Content Detector')).toBeInTheDocument();
    });

    it('has correct link hrefs', () => {
        render(<Navigation />);

        const homeLink = screen.getByText('Alethea').closest('a');
        const newsLink = screen.getByText('News Summarizer').closest('a');
        const detectorLink = screen.getByText('Content Detector').closest('a');

        expect(homeLink).toHaveAttribute('href', '/');
        expect(newsLink).toHaveAttribute('href', '/news');
        expect(detectorLink).toHaveAttribute('href', '/detector');
    });
});