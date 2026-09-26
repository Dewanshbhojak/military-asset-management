-- Initialize MySQL databases for Distributed Military Asset Management System
CREATE DATABASE IF NOT EXISTS `auth_db`;
CREATE DATABASE IF NOT EXISTS `asset_db`;
CREATE DATABASE IF NOT EXISTS `transaction_db`;
CREATE DATABASE IF NOT EXISTS `audit_db`;

-- Grant permissions to root user
GRANT ALL PRIVILEGES ON `auth_db`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `asset_db`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `transaction_db`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `audit_db`.* TO 'root'@'%';

FLUSH PRIVILEGES;
