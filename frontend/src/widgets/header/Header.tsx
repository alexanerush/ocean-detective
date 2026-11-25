export default function Header() {
  return (
    <header className="header">
      <div>
        <span className="eyebrow">Satellite Intelligence Platform</span>

        <h1>Ocean Detective</h1>

        <p>Detection and analysis of marine debris using Sentinel-2 satellite imagery.</p>
      </div>

      <div className="status">
        <span className="status-dot" aria-hidden="true" />
        Frontend ready
      </div>
    </header>
  );
}
