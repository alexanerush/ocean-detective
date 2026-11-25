REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO ocean_app, ocean_read;
GRANT SELECT ON users, satellite_images, analyses, detections, ml_models, object_classes, v_analysis_history TO ocean_app;
GRANT INSERT, UPDATE ON users, satellite_images, analyses, detections TO ocean_app;
GRANT USAGE, SELECT ON SEQUENCE users_user_id_seq, satellite_images_image_id_seq, analyses_analysis_id_seq, detections_detection_id_seq TO ocean_app;
GRANT SELECT ON satellite_images, analyses, detections, ml_models, object_classes, v_analysis_history TO ocean_read;
REVOKE ALL ON FUNCTION claim_pending_analysis(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION claim_pending_analysis(bigint) TO ocean_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
