CREATE TABLE IF NOT EXISTS admin_users (
 id CHAR(36) PRIMARY KEY, name VARCHAR(100) NOT NULL,
 username VARCHAR(50) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
 password_hash VARCHAR(255) NOT NULL, active TINYINT NOT NULL DEFAULT 1,
 created_at VARCHAR(40) NOT NULL,
 UNIQUE KEY admin_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS admin_user_sessions (
 token_hash CHAR(64) PRIMARY KEY, admin_user_id CHAR(36) NOT NULL,
 credential_version CHAR(64) NOT NULL, expires_at BIGINT NOT NULL,
 INDEX admin_user_session_owner (admin_user_id), INDEX admin_user_session_expiry (expires_at),
 CONSTRAINT admin_session_user FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
