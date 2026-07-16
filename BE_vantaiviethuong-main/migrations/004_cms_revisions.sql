CREATE TABLE IF NOT EXISTS cms_revisions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  module VARCHAR(32) NOT NULL,
  version_number INT UNSIGNED NOT NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  snapshot JSON NOT NULL,
  change_summary VARCHAR(255) NULL,
  created_by INT NULL,
  restored_from_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME NULL,
  CONSTRAINT fk_cms_revisions_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_cms_revisions_restored_from
    FOREIGN KEY (restored_from_id) REFERENCES cms_revisions(id) ON DELETE SET NULL,
  UNIQUE KEY uq_cms_revision_version (module, version_number),
  INDEX idx_cms_revision_module_created (module, created_at),
  INDEX idx_cms_revision_module_status (module, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
