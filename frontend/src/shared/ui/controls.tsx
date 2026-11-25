import type { ButtonHTMLAttributes, ReactNode, InputHTMLAttributes } from 'react';
import { useId } from 'react';
export function Button({
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={`od-button ${className}`} {...props} />;
}
export function Panel({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <section className="od-panel">
      {title && <h3>{title}</h3>}
      {children}
    </section>
  );
}
export function Field({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const generated = useId();
  const id = props.id ?? generated;
  return (
    <div className="od-field">
      <label htmlFor={id}>{label}</label>
      <input
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : props['aria-describedby']}
      />
      {error && (
        <span id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
export function Skeleton() {
  return (
    <div role="status" className="od-skeleton">
      <span>Loading page…</span>
      <div />
      <div />
      <div />
    </div>
  );
}
