# Integration Tutorial

## Satellite Image Analysis Workflow

This tutorial demonstrates a complete REST API
integration using curl.

The workflow includes authentication, image upload,
ML inference, result retrieval and logout.

## 1. Configure the client

Run the backend and configure the following
variables in a separate terminal:

    BASE=http://localhost:3000
    ORIGIN=http://localhost:5173
    COOKIE_JAR=$(mktemp)
    chmod 600 "$COOKIE_JAR"

Adjust ORIGIN if the backend CORS_ORIGIN differs.

## 2. Register a user

Use a new email address and replace the example
password with a unique local test password.

    curl -i -c "$COOKIE_JAR" \
      -H "Origin: $ORIGIN" \
      -H "Content-Type: application/json" \
      -d '{"email":"tutorial@example.com","password":"REPLACE_WITH_TEST_PASSWORD"}' \
      "$BASE/api/auth/register"

Expected status: 201 Created.

The response contains the user ID and email.
The session cookie is saved in COOKIE_JAR.

If the email already exists, use /api/auth/login
with the same request body and cookie options.

Expected login status: 200 OK.

## 3. Verify the session

    curl -i -b "$COOKIE_JAR" \
      "$BASE/api/auth/me"

Expected status: 200 OK.

Without a valid session, the API returns 401.

## 4. Upload a satellite image

Set IMAGE to an existing local GeoTIFF:

    IMAGE="/absolute/path/to/image.tif"

Upload the file:

    curl -i -b "$COOKIE_JAR" \
      -H "Origin: $ORIGIN" \
      -F "image=@$IMAGE" \
      "$BASE/api/images"

Expected status: 201 Created.

The response contains image metadata, including
image_id, dimensions and band count.

Upload constraints:

- Maximum file size: 25 MiB.
- Maximum dimensions: 1024 x 1024 pixels.
- Between 1 and 11 bands.
- Maximum decoded raster size: 128 MiB.
- A valid georeferenced GeoTIFF is required.

ML inference requires exactly 11 compatible bands.

## 5. Retrieve uploaded images

    curl -i -b "$COOKIE_JAR" \
      "$BASE/api/images?page=0"

Expected status: 200 OK.

The response contains items and total.
Each page contains up to 20 images.

## 6. Execute ML analysis

Copy image_id from the upload response:

    IMAGE_ID=1

Replace 1 with the actual image identifier.

Confirm that the image uses MARIDA-compatible
reflectance preprocessing and this band order:

B01, B02, B03, B04, B05, B06, B07, B08,
B8A, B11, B12.

Only set confirmed to true after verifying
these compatibility requirements.

    curl -i -b "$COOKIE_JAR" \
      --max-time 90 \
      -H "Origin: $ORIGIN" \
      -H "Content-Type: application/json" \
      -d "{\"imageId\":\"$IMAGE_ID\",\"confirmed\":true}" \
      "$BASE/api/analyses"

Expected status: 201 Created.

Example response:

    {
      "analysis_id": "1",
      "status": "COMPLETED"
    }

The inference process has a 60-second timeout.

## 7. Retrieve analysis metadata

Replace 1 with the returned analysis identifier:

    ANALYSIS_ID=1

    curl -i -b "$COOKIE_JAR" \
      "$BASE/api/analyses/$ANALYSIS_ID"

Expected status: 200 OK.

## 8. Retrieve analysis history

    curl -i -b "$COOKIE_JAR" \
      "$BASE/api/analyses?imageId=$IMAGE_ID"

Expected status: 200 OK.

The response contains up to 100 analysis records
for the selected image.

## 9. Download analysis results

Download the structured ML summary:

    curl -fS -b "$COOKIE_JAR" \
      "$BASE/api/analyses/$ANALYSIS_ID/files/analysis.json" \
      -o analysis.json

Download the visualization:

    curl -fS -b "$COOKIE_JAR" \
      "$BASE/api/analyses/$ANALYSIS_ID/files/overlay.png" \
      -o overlay.png

Download the georeferenced segmentation mask:

    curl -fS -b "$COOKIE_JAR" \
      "$BASE/api/analyses/$ANALYSIS_ID/files/mask.tif" \
      -o mask.tif

Other available artifacts:

- rgb.png
- segmentation.png
- confidence.png
- confidence-values.png
- confidence.tif

The JSON summary includes class-level pixel counts,
mean confidence, raster metadata and processing time.

Confidence represents the maximum Random Forest
predict_proba value and is not calibrated.

Pixel counts do not represent individual objects
or physical debris mass.

## 10. Retrieve public research metrics

    curl -i "$BASE/api/model-comparison"

Expected status: 200 OK.

This endpoint returns the recorded validation
experiment comparing RGB and multispectral models.

These research metrics are separate from
individual user-uploaded image predictions.

## 11. Troubleshooting

- 400: invalid request or identifier.
- 401: missing or expired session.
- 403: Origin does not match CORS_ORIGIN.
- 404: resource not found or inaccessible.
- 409: duplicate email or busy sample analysis.
- 413: upload or request exceeds size limits.
- 415: unsupported file.
- 422: incompatible raster or failed inference.
- 429: rate limit or processing concurrency limit.
- 500: unexpected server error.
- 503: required service or model catalog unavailable.

See the OpenAPI specification for endpoint-specific
error codes and response examples.

## 12. Log out

    curl -i -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
      -X POST \
      -H "Origin: $ORIGIN" \
      "$BASE/api/auth/logout"

Expected status: 204 No Content.

Remove the local session cookie file:

    rm -f "$COOKIE_JAR"

Logout clears the client cookie. It does not revoke
an already issued JWT before its expiration.

## 13. Summary

The integration demonstrates:

- Session-based authentication.
- Multipart GeoTIFF upload.
- Owner-scoped resource access.
- Multispectral ML inference.
- Analysis history retrieval.
- JSON, PNG and GeoTIFF artifact downloads.
- Error handling and session cleanup.

## 14. Integration Verification

The integration workflow was successfully verified
on November 25, 2026, using the running backend,
PostgreSQL database and trained multispectral
Random Forest model.

| Verification category | Result |
|---|---|
| API health | Passed |
| Registration and authentication | Passed |
| Unauthorized access handling | Passed |
| GeoTIFF upload | Passed |
| Image listing | Passed |
| Band compatibility confirmation | Passed |
| ML inference | Passed |
| Analysis metadata and history | Passed |
| All eight analysis artifacts | Passed |
| Research model comparison | Passed |
| Login and logout | Passed |
| Total integration checks | 24/24 passed |

All checks were executed against the actual local
API rather than mocked responses.

These checks verify the integration workflow and
expected HTTP status codes. They do not constitute
exhaustive OpenAPI response-schema validation.
