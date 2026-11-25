import { env } from '../config/env';
export function resultsUrl(path: string, version?: number): string {
  const url = new URL(path, new URL(env.apiUrl, window.location.origin));
  if (version !== undefined) url.searchParams.set('t', String(version));
  return url.href;
}
