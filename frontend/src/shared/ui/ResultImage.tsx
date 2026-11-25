import { useState } from 'react';
export function ResultImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="od-result-image">
      <figcaption>{alt}</figcaption>
      {failed ? (
        <p role="alert">Image unavailable.</p>
      ) : (
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      )}
    </figure>
  );
}
