import { render, screen } from '@testing-library/react';
import ConfidenceScore from '../ConfidenceScore';

describe('ConfidenceScore', () => {
    it('renders authentic classification correctly', () => {
        render(
            <ConfidenceScore
                score={85}
                classification="authentic"
            />
        );

        expect(screen.getByText('authentic')).toBeInTheDocument();
        expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('renders suspicious classification correctly', () => {
        render(
            <ConfidenceScore
                score={55}
                classification="suspicious"
            />
        );

        expect(screen.getByText('suspicious')).toBeInTheDocument();
        expect(screen.getByText('55%')).toBeInTheDocument();
    });

    it('renders fake classification correctly', () => {
        render(
            <ConfidenceScore
                score={25}
                classification="fake"
            />
        );

        expect(screen.getByText('fake')).toBeInTheDocument();
        expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('applies correct color classes for authentic', () => {
        const { container } = render(
            <ConfidenceScore
                score={85}
                classification="authentic"
            />
        );

        const element = container.querySelector('.text-green-700');
        expect(element).toBeInTheDocument();
    });

    it('applies correct color classes for suspicious', () => {
        const { container } = render(
            <ConfidenceScore
                score={55}
                classification="suspicious"
            />
        );

        const element = container.querySelector('.text-yellow-700');
        expect(element).toBeInTheDocument();
    });

    it('applies correct color classes for fake', () => {
        const { container } = render(
            <ConfidenceScore
                score={25}
                classification="fake"
            />
        );

        const element = container.querySelector('.text-red-700');
        expect(element).toBeInTheDocument();
    });

    it('renders different sizes correctly', () => {
        const { rerender } = render(
            <ConfidenceScore
                score={75}
                classification="authentic"
                size="sm"
            />
        );

        expect(screen.getByText('authentic').parentElement).toHaveClass('text-sm');

        rerender(
            <ConfidenceScore
                score={75}
                classification="authentic"
                size="lg"
            />
        );

        expect(screen.getByText('authentic').parentElement).toHaveClass('text-lg');
    });

    it('shows progress bar with correct width', () => {
        const { container } = render(
            <ConfidenceScore
                score={75}
                classification="authentic"
            />
        );

        const progressBar = container.querySelector('[style*="width: 75%"]');
        expect(progressBar).toBeInTheDocument();
    });
});