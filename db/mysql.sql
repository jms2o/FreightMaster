CREATE TABLE IF NOT EXISTS drivers (
 id VARCHAR(30) PRIMARY KEY, name VARCHAR(100) NOT NULL, salt VARCHAR(64) NOT NULL,
 pin_hash VARCHAR(64) NOT NULL, active TINYINT NOT NULL DEFAULT 1, created_at VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS driver_sessions (
 token_hash CHAR(64) PRIMARY KEY, driver_id VARCHAR(30) NOT NULL, expires_at BIGINT NOT NULL,
 INDEX driver_session_owner (driver_id), INDEX driver_session_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS admin_sessions (
 token_hash CHAR(64) PRIMARY KEY, credential_version CHAR(64) NOT NULL, expires_at BIGINT NOT NULL,
 INDEX admin_session_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS login_attempts (
 `key` VARCHAR(191) PRIMARY KEY, `count` INT NOT NULL, `until` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS quotes (
 id CHAR(36) PRIMARY KEY, company VARCHAR(500) NOT NULL, contact VARCHAR(500) NOT NULL,
 origin VARCHAR(500) NOT NULL, destination VARCHAR(500) NOT NULL, cargo TEXT NOT NULL, created_at VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS itinerary_stops (
 id CHAR(36) PRIMARY KEY, driver_id VARCHAR(30) NOT NULL, `date` CHAR(10) NOT NULL, `sequence` INT NOT NULL,
 operation VARCHAR(30) NOT NULL, location VARCHAR(500) NOT NULL, planned_time VARCHAR(5) NOT NULL DEFAULT '',
 reference VARCHAR(100) NOT NULL DEFAULT '', instructions TEXT NOT NULL, requirements TEXT NOT NULL,
 active TINYINT NOT NULL DEFAULT 1, INDEX itinerary_driver_date (driver_id, `date`, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS company_settings (
 `key` VARCHAR(100) PRIMARY KEY, value TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
