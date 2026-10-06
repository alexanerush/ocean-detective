# Backend API

This directory contains the backend service for the **Ocean Detective** project.

The backend is built with **Node.js, TypeScript, and Express** and provides an API layer between the web interface and the satellite imagery analysis module.

## Technologies

- Node.js
- TypeScript
- Express
- tsx

## Current Functionality

The current backend implementation provides a basic REST API and health check functionality.

Available endpoints:

### `GET /`

Returns basic information about the Ocean Detective backend.

Example response:

```json
{
  "project": "Ocean Detective",
  "message": "Backend API is running"
}
```

### `GET /api/health`

Checks whether the backend service is running correctly.

Example response:

```json
{
  "status": "ok",
  "service": "ocean-detective-backend"
}
```

## Structure

```text
backend/
├── src/
│   └── server.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

The compiled `dist/` directory and installed `node_modules/` dependencies are excluded from Git tracking.

## Installation

Install the required dependencies:

```bash
npm install
```

## Development

Run the backend directly in development mode:

```bash
npm run dev
```

The server will start at:

```text
http://localhost:3000
```

## Build

Compile the TypeScript source code:

```bash
npm run build
```

The compiled JavaScript files are generated in the `dist/` directory.

## Production Start

After building the project, run:

```bash
npm start
```

## Current Stage

The backend currently provides the initial API infrastructure for the project.

The service has been successfully configured and tested locally using HTTP requests to the root and health-check endpoints.

## Future Development

Planned backend development includes:

- API endpoints for satellite image analysis;
- communication with the Python analysis module;
- processing analysis requests from the frontend;
- returning detected marine debris information and generated results;
- error handling and input validation.