import 'dotenv/config';
function required(key: string): string { const value = process.env[key]; if (!value) throw new Error(`Missing ${key}`); return value; }
function port(key: string, fallback: number): number { const n = Number(process.env[key] ?? fallback); if (!Number.isInteger(n) || n < 1 || n > 65535) throw new Error(`Invalid ${key}`); return n; }
export const env = { port: port('PORT',3000), dbHost: process.env.DB_HOST ?? '127.0.0.1', dbPort: port('DB_PORT',5433), dbName: required('DB_NAME'), dbUser: required('DB_USER'), dbPassword: required('DB_PASSWORD'), corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', python: process.env.PYTHON_BIN ?? 'python3' };
