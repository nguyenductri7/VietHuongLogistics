ALTER TABLE contact_messages
  ADD COLUMN admin_note TEXT NULL AFTER message,
  ADD COLUMN last_action VARCHAR(50) NULL AFTER admin_note,
  ADD COLUMN last_action_at TIMESTAMP NULL AFTER last_action;

ALTER TABLE faq_inquiries
  ADD COLUMN admin_note TEXT NULL AFTER question,
  ADD COLUMN last_action VARCHAR(50) NULL AFTER admin_note,
  ADD COLUMN last_action_at TIMESTAMP NULL AFTER last_action;
