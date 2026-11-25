import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './workflow.css';
export function ImageComparison({ before, after }: { before: string; after: string }) {
  const [position, setPosition] = useState(50);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();
  return (
    <figure className="od-comparison">
      <figcaption>RGB and annotated debris overlay comparison</figcaption>
      {failed ? (
        <p role="alert">Comparison images unavailable.</p>
      ) : (
        <>
          <div className="od-comparison-stage">
            <img src={before} alt="Original RGB sample" onError={() => setFailed(true)} />
            <motion.img
              src={after}
              alt="Annotated marine debris overlay"
              onError={() => setFailed(true)}
              initial={false}
              animate={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
              transition={{ duration: reduced ? 0 : 0.12 }}
            />
          </div>
          <label>
            Overlay coverage: {position}%
            <input
              type="range"
              min={0}
              max={100}
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
            />
          </label>
        </>
      )}
    </figure>
  );
}
