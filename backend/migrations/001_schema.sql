-- Ocean Detective: proposed OLTP schema (PostgreSQL 13+)
-- Design artifact: not yet executed against a live database.

CREATE TABLE users (
  user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_nonempty CHECK (length(trim(email)) > 3)
);
CREATE TABLE satellite_images (
  image_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  original_filename TEXT NOT NULL,
  storage_uri TEXT NOT NULL,
  sha256 CHAR(64) NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 26214400),
  width_pixels INTEGER NOT NULL CHECK (width_pixels BETWEEN 1 AND 1024),
  height_pixels INTEGER NOT NULL CHECK (height_pixels BETWEEN 1 AND 1024),
  band_count SMALLINT NOT NULL CHECK (band_count BETWEEN 1 AND 11),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT image_filename_nonempty CHECK (length(trim(original_filename)) > 0),
  CONSTRAINT image_storage_uri_nonempty CHECK (length(trim(storage_uri)) > 0),
  CONSTRAINT image_sha256_hex CHECK (sha256 ~ '^[0-9a-fA-F]{64}$')
);
CREATE TABLE ml_models (
  model_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  model_name VARCHAR(100) NOT NULL,
  version VARCHAR(50) NOT NULL,
  artifact_uri TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT model_name_version_unique UNIQUE (model_name, version)
);
CREATE TABLE analyses (
  analysis_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  image_id BIGINT NOT NULL REFERENCES satellite_images(image_id) ON DELETE RESTRICT,
  model_id BIGINT NOT NULL REFERENCES ml_models(model_id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  mask_storage_uri TEXT,
  error_message TEXT,
  CONSTRAINT analysis_status_allowed CHECK (status IN ('PENDING','RUNNING','COMPLETED','FAILED')),
  CONSTRAINT analysis_completed_consistency CHECK (
    (status = 'COMPLETED' AND completed_at IS NOT NULL AND mask_storage_uri IS NOT NULL AND error_message IS NULL)
    OR (status = 'FAILED' AND completed_at IS NOT NULL AND mask_storage_uri IS NULL)
    OR (status IN ('PENDING','RUNNING') AND completed_at IS NULL AND mask_storage_uri IS NULL AND error_message IS NULL)
  ),
  CONSTRAINT analysis_completed_after_submit CHECK (completed_at IS NULL OR completed_at >= submitted_at)
);
CREATE TABLE object_classes (
  class_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  class_code INTEGER NOT NULL UNIQUE,
  class_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);
CREATE TABLE detections (
  detection_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  analysis_id BIGINT NOT NULL REFERENCES analyses(analysis_id) ON DELETE CASCADE,
  class_id BIGINT NOT NULL REFERENCES object_classes(class_id) ON DELETE RESTRICT,
  pixel_count INTEGER NOT NULL CHECK (pixel_count >= 0),
  mean_confidence NUMERIC(5,4) CHECK (mean_confidence BETWEEN 0 AND 1),
  CONSTRAINT detection_unique_class_per_analysis UNIQUE (analysis_id, class_id)
);
CREATE INDEX idx_images_user_id ON satellite_images(user_id);
CREATE INDEX idx_analyses_image_id ON analyses(image_id);
CREATE INDEX idx_analyses_model_id ON analyses(model_id);
CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_detections_class_id ON detections(class_id);
