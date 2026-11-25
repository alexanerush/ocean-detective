export function BarChart({
  title,
  items,
  max,
}: {
  title: string;
  items: { label: string; value: number }[];
  max?: number;
}) {
  const limit = max ?? Math.max(1, ...items.map((x) => x.value));
  return (
    <figure className="od-chart">
      <figcaption>{title}</figcaption>
      {items.map((item) => (
        <div className="od-chart-row" key={item.label}>
          <span>{item.label}</span>
          <meter min={0} max={limit} value={item.value} aria-label={item.label} />
          <strong>
            {item.value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </strong>
        </div>
      ))}
    </figure>
  );
}
