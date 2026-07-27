CREATE TABLE IF NOT EXISTS crm_reminders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contact_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  notes TEXT NULL,
  reminder_type VARCHAR(32) NOT NULL DEFAULT 'call',
  priority ENUM('low', 'normal', 'high') NOT NULL DEFAULT 'normal',
  remind_at DATETIME NOT NULL,
  status ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  email_reminder_enabled TINYINT(1) NOT NULL DEFAULT 0,
  email_sent_at DATETIME NULL,
  created_by INT NULL,
  completed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_crm_reminder_contact
    FOREIGN KEY (contact_id) REFERENCES contact_messages(id) ON DELETE CASCADE,
  CONSTRAINT fk_crm_reminder_admin
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_crm_reminder_status_time (status, remind_at),
  INDEX idx_crm_reminder_contact_time (contact_id, remind_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
