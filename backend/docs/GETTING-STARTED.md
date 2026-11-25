# Getting Started with Ocean Detective API

## 1. Overview

Ocean Detective provides a REST API for satellite
image management, marine debris detection,
multispectral image analysis and research evaluation.

The API uses JSON for structured data and
multipart/form-data for satellite image uploads.

## 2. Prerequisites

- Node.js and npm
- PostgreSQL
- Python 3 with the project ML dependencies
- A trained multispectral Random Forest model
- A MARIDA-compatible GeoTIFF for inference

Follow the backend README for database configuration,
environment variables and database migrations.

Follow the ML README for model preparation.

## 3. Installation

From the backend directory:

    npm ci

Configure the local .env file using .env.example.
Never commit database passwords or JWT secrets.

Apply the database migrations according to the
backend README.

## 4. Start the API

    npm run dev

Default base URL:

    http://localhost:3000

## 5. API documentation

- Swagger UI: http://localhost:3000/api/docs/
- OpenAPI JSON: http://localhost:3000/api/openapi.json
- OpenAPI YAML: openapi.yaml

Validate the specification:

    npm run docs:validate

Build the backend:

    npm run build

## 6. Verify availability

    curl -i http://localhost:3000/api/health

A successful response returns HTTP 200:

    {
      "status": "ok",
      "service": "ocean-detective-backend",
      "database": "connected"
    }

HTTP 503 indicates that the database is unavailable.

## 7. Authentication

Authentication uses a JWT stored in the HttpOnly
od_session cookie.

Register or sign in to establish a session.
The session expires after one hour.

Browser clients must enable credentials when
sending cross-origin requests.

Protected write operations require an Origin
header matching the configured CORS_ORIGIN.

Swagger UI supports API exploration. Requests
requiring a different allowed Origin should be
performed using the frontend or the curl tutorial.

## 8. Error handling

Most application errors use the following format:

    {
      "status": "error",
      "code": "UNAUTHORIZED",
      "message": "Sign in required",
      "requestId": "example-request-id"
    }

The X-Request-ID response header supports
request tracing and troubleshooting.

Health-check failures and the default upload
rate limiter use different response formats.

## 9. Next steps

Follow INTEGRATION-TUTORIAL.md to register,
upload a satellite image, execute ML inference
and retrieve the analysis artifacts.
