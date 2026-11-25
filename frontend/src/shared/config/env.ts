const apiUrl = import.meta.env.VITE_API_URL;

const apiTimeout = Number(import.meta.env.VITE_API_TIMEOUT ?? 90000);

if (!apiUrl) {
  throw new Error('VITE_API_URL is not configured.');
}

if (!Number.isFinite(apiTimeout) || apiTimeout <= 0) {
  throw new Error('Invalid VITE_API_TIMEOUT value.');
}

export const env = {
  apiUrl,
  apiTimeout,
} as const;
