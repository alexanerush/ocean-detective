import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageUpload from '../src/features/image-upload/ImageUpload';
it('rejects invalid extension', () => {
  const select = vi.fn();
  render(<ImageUpload onFileSelect={select} />);
  fireEvent.change(screen.getByLabelText('Select satellite image'), {
    target: { files: [new File(['x'], 'bad.png')] },
  });
  expect(screen.getByRole('alert')).toHaveTextContent('Only GeoTIFF');
  expect(select).toHaveBeenLastCalledWith(null);
});
it('rejects empty file', () => {
  render(<ImageUpload onFileSelect={vi.fn()} />);
  fireEvent.change(screen.getByLabelText('Select satellite image'), {
    target: { files: [new File([], 'empty.tif')] },
  });
  expect(screen.getByRole('alert')).toHaveTextContent('empty');
});
it('accepts nonempty TIFF by client metadata', () => {
  const select = vi.fn();
  const file = new File(['test'], 'sample.TIFF');
  render(<ImageUpload onFileSelect={select} />);
  fireEvent.change(screen.getByLabelText('Select satellite image'), {
    target: { files: [file] },
  });
  expect(select).toHaveBeenLastCalledWith(file);
  expect(screen.getByText('sample.TIFF')).toBeInTheDocument();
});
