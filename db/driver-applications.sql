CREATE TABLE IF NOT EXISTS driver_applications (
 id CHAR(36) PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(254) NOT NULL,
 phone VARCHAR(40) NOT NULL, company VARCHAR(150) NOT NULL DEFAULT '',
 status VARCHAR(20) NOT NULL DEFAULT 'new', consented_at VARCHAR(40) NOT NULL,
 created_at VARCHAR(40) NOT NULL, updated_at VARCHAR(40) NOT NULL,
 INDEX application_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS driver_application_documents (
 id CHAR(36) PRIMARY KEY, application_id CHAR(36) NOT NULL, kind VARCHAR(30) NOT NULL,
 filename VARCHAR(100) NOT NULL, mime_type VARCHAR(50) NOT NULL, byte_size INT UNSIGNED NOT NULL,
 content MEDIUMBLOB NOT NULL, created_at VARCHAR(40) NOT NULL,
 UNIQUE KEY application_document_kind (application_id,kind),
 CONSTRAINT document_application_owner FOREIGN KEY (application_id) REFERENCES driver_applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
