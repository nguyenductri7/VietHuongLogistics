ALTER TABLE contact_messages
  ADD COLUMN pipeline_stage VARCHAR(32) NOT NULL DEFAULT 'new_lead' AFTER status,
  ADD COLUMN pipeline_position INT NOT NULL DEFAULT 0 AFTER pipeline_stage,
  ADD INDEX idx_contact_pipeline (pipeline_stage, pipeline_position, created_at);

CREATE TABLE IF NOT EXISTS crm_activities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contact_id INT NOT NULL,
  activity_type VARCHAR(32) NOT NULL DEFAULT 'note',
  title VARCHAR(180) NOT NULL,
  description TEXT NULL,
  from_stage VARCHAR(32) NULL,
  to_stage VARCHAR(32) NULL,
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_crm_activity_contact
    FOREIGN KEY (contact_id) REFERENCES contact_messages(id) ON DELETE CASCADE,
  CONSTRAINT fk_crm_activity_admin
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_crm_activity_contact_created (contact_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO crm_activities (contact_id, activity_type, title, description)
SELECT id, 'created', 'Tiếp nhận khách hàng', 'Liên hệ được đưa vào pipeline CRM.'
FROM contact_messages;
