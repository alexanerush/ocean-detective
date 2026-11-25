import { useEffect, useState } from 'react';
import { Icon } from '../../shared/ui/Icon';
type Theme = 'system' | 'dark' | 'light';
function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export default function DisplaySettings() {
  const [theme, setTheme] = useState<Theme>(() => {
    const v = read('od-theme');
    return v === 'light' || v === 'dark' ? v : 'system';
  });
  const [scale, setScale] = useState(() => {
    const v = Number(read('od-scale'));
    return [100, 112, 125].includes(v) ? v : 100;
  });
  const [device, setDevice] = useState('');
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.scale = String(scale);
    try {
      localStorage.setItem('od-theme', theme);
      localStorage.setItem('od-scale', String(scale));
    } catch {
      /* storage unavailable */
    }
  }, [theme, scale]);
  useEffect(() => {
    let density: MediaQueryList | undefined;
    const update = () => {
      density?.removeEventListener('change', update);
      const w = window.innerWidth,
        h = window.innerHeight;
      const ratio = window.devicePixelRatio;
      document.documentElement.dataset.orientation = w >= h ? 'landscape' : 'portrait';
      document.documentElement.dataset.density = ratio >= 2 ? 'high' : 'standard';
      document.documentElement.dataset.aspect = w / h >= 2 ? 'wide' : 'standard';
      setDevice(
        `${w} × ${h} · ${ratio.toFixed(2)} DPR · ${w >= h ? 'landscape' : 'portrait'}`,
      );
      density = matchMedia(`(resolution: ${ratio}dppx)`);
      density.addEventListener('change', update);
    };
    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      density?.removeEventListener('change', update);
    };
  }, []);
  return (
    <details className="od-settings">
      <summary>
        <Icon name="settings" /> Display settings
      </summary>
      <div className="od-settings-body">
        <label>
          Color scheme
          <select
            value={theme}
            onChange={(e) => {
              const v = e.target.value;
              if (v === 'system' || v === 'dark' || v === 'light') setTheme(v);
            }}
          >
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
        <label>
          Text scale
          <select value={scale} onChange={(e) => setScale(Number(e.target.value))}>
            {[100, 112, 125].map((v) => (
              <option key={v} value={v}>
                {v}%
              </option>
            ))}
          </select>
        </label>
        <small>{device}</small>
      </div>
    </details>
  );
}
