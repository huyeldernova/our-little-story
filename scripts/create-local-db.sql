-- Run as the MySQL root user:   mysql -u root -p < scripts/create-local-db.sql
-- Then put the same password in DB_PASSWORD in your .env (replace the placeholder below first!).
CREATE DATABASE IF NOT EXISTS our_little_story CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'ols_app'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON our_little_story.* TO 'ols_app'@'localhost';
-- Optional: a separate database to run the backend test-suite against real MySQL.
CREATE DATABASE IF NOT EXISTS ols_test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
GRANT ALL PRIVILEGES ON ols_test.* TO 'ols_app'@'localhost';
FLUSH PRIVILEGES;
