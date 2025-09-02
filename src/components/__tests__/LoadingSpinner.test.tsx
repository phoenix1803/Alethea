import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders without text', () => {
        const { container } = render(<LoadingSpinner />);

        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('renders with text', () => {
        render(<LoadingSpinner text="Loading..." />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('applies correct size classes', () => {
        const { rerender, container } = render(<LoadingSpinner size="sm" />);

        let spinner = container.querySelector('.w-4');
        expect(spinner).toBeInTheDocument();

        rerender(<LoadingSpinner size="lg" />);
        spinner = container.querySelector('.w-8');
        expect(spinner).toBeInTheDocument();

        rerender(<LoadingSpinner size="md" />);
        spinner = container.querySelector('.w-6');
        expect(spinner).toBeInTheDocument();
    });

    it('has spinning animation', () => {
        const { container } = render(<LoadingSpinner />);

        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('uses correct color scheme', () => {
        const { container } = render(<LoadingSpinner text="Loading..." />);

        const spinner = container.querySelector('.border-gray-600');
        expect(spinner).toBeInTheDocument();

        const borderTop = container.querySelector('.border-t-white');
        expect(borderTop).toBeInTheDocument();

        const text = screen.getByText('Loading...');
        expect(text).toHaveClass('text-gray-400');
    });
});