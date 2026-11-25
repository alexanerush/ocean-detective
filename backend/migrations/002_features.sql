-- Optional advanced OLTP features; apply after 001_schema.sql

CREATE INDEX IF NOT EXISTS idx_analyses_image_submitted ON analyses(image_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_pending ON analyses(submitted_at) WHERE status = 'PENDING';
CREATE OR REPLACE VIEW v_analysis_history AS
SELECT a.analysis_id, a.image_id, i.original_filename, a.status,
       a.submitted_at, a.completed_at, m.model_name, m.version
FROM analyses a JOIN satellite_images i ON i.image_id = a.image_id
JOIN ml_models m ON m.model_id = a.model_id;
-- Reject accidental updates to completed analyses (except no-op updates).
CREATE OR REPLACE FUNCTION prevent_completed_analysis_changes() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.status = 'COMPLETED' AND ROW(NEW.*) IS DISTINCT FROM ROW(OLD.*) THEN
   RAISE EXCEPTION 'Completed analysis % is immutable', OLD.analysis_id;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER trg_completed_analysis_immutable BEFORE UPDATE ON analyses
FOR EACH ROW EXECUTE FUNCTION prevent_completed_analysis_changes();
-- A database-side business operation for claiming a pending job.
CREATE OR REPLACE FUNCTION claim_pending_analysis(p_id BIGINT) RETURNS BOOLEAN
LANGUAGE plpgsql AS $$
DECLARE n INTEGER;
BEGIN
 UPDATE analyses SET status='RUNNING' WHERE analysis_id=p_id AND status='PENDING';
 GET DIAGNOSTICS n = ROW_COUNT;
 RETURN n=1;
END $$;
