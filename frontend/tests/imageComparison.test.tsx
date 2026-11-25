import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageComparison } from '../src/shared/ui/ImageComparison';

const images = {
  before: '/results/rgb.png',
  after: '/results/overlay.png',
};

describe('ImageComparison', () => {
  it('renders both satellite images with accessible descriptions', () => {
    render(<ImageComparison {...images} />);

    expect(
      screen.getByRole('img', { name: 'Original RGB sample' })
    ).toHaveAttribute('src', images.before);

    expect(
      screen.getByRole('img', {
        name: 'Annotated marine debris overlay',
      })
    ).toHaveAttribute('src', images.after);
  });

  it('initializes overlay coverage at 50 percent', () => {
    render(<ImageComparison {...images} />);

    const slider = screen.getByRole('slider', {
      name: /Overlay coverage/i,
    });

    expect(slider).toHaveValue('50');
    expect(screen.getByText('Overlay coverage: 50%'))
      .toBeInTheDocument();
  });

  it('updates overlay coverage when the slider changes', () => {
    render(<ImageComparison {...images} />);

    const slider = screen.getByRole('slider');

    fireEvent.change(slider, {
      target: { value: '75' },
    });

    expect(slider).toHaveValue('75');
    expect(screen.getByText('Overlay coverage: 75%'))
      .toBeInTheDocument();
  });

  it('supports the full overlay coverage range', () => {
    render(<ImageComparison {...images} />);

    const slider = screen.getByRole('slider');

    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');

    fireEvent.change(slider, {
      target: { value: '0' },
    });
    expect(slider).toHaveValue('0');

    fireEvent.change(slider, {
      target: { value: '100' },
    });
    expect(slider).toHaveValue('100');
  });

  it('displays an error when the original image fails to load', () => {
    render(<ImageComparison {...images} />);

    fireEvent.error(
      screen.getByRole('img', { name: 'Original RGB sample' })
    );

    expect(screen.getByRole('alert'))
      .toHaveTextContent('Comparison images unavailable.');

    expect(screen.queryByRole('slider'))
      .not.toBeInTheDocument();
  });

  it('displays an error when the overlay image fails to load', () => {
    render(<ImageComparison {...images} />);

    fireEvent.error(
      screen.getByRole('img', {
        name: 'Annotated marine debris overlay',
      })
    );

    expect(screen.getByRole('alert'))
      .toHaveTextContent('Comparison images unavailable.');
  });
});
