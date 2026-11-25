import { Icon } from '../../shared/ui/Icon';
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import './ImageUpload.css';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.tif', '.tiff'];

interface ImageUploadProps {
  onFileSelect: (file: File | null) => void;
}

export default function ImageUpload({ onFileSelect }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setError(null);
    setSelectedFile(null);
    onFileSelect(null);

    if (!file) {
      return;
    }

    const isValidExtension = ALLOWED_EXTENSIONS.some((extension) =>
      file.name.toLowerCase().endsWith(extension),
    );

    if (!isValidExtension) {
      setError('Only GeoTIFF (.tif, .tiff) files are allowed.');
      event.target.value = '';
      return;
    }

    if (file.size === 0) {
      setError('The selected file is empty.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must not exceed 25 MiB.');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  }

  return (
    <section className="od-upload">
      <span className="eyebrow">INPUT DATA</span>

      <h3>Upload Satellite Image</h3>

      <p>Select a multispectral satellite image in GeoTIFF format.</p>

      <label className="od-upload-area">
        <span className="od-upload-icon" aria-hidden="true">
          <Icon name="upload" />
        </span>

        <strong>Choose satellite image</strong>

        <span>GeoTIFF (.tif, .tiff) — up to 25 MiB</span>

        <input
          type="file"
          accept=".tif,.tiff"
          onChange={handleFileChange}
          aria-label="Select satellite image"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'upload-error' : undefined}
        />
      </label>

      {error && (
        <div id="upload-error" className="od-upload-error" role="alert">
          {error}
        </div>
      )}

      {selectedFile && (
        <div className="od-upload-file" role="status">
          <div>
            <strong>{selectedFile.name}</strong>

            <p>
              {(selectedFile.size / 1024 / 1024).toFixed(2)}
              {' MiB'}
            </p>
          </div>

          <span className="od-upload-valid">File selected</span>
        </div>
      )}
    </section>
  );
}
