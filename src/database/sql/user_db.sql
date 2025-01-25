CREATE TABLE IF NOT EXISTS users
(
    user_key       INT PRIMARY KEY AUTO_INCREMENT,
    id          VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    win_count   INT DEFAULT 0,
    lose_count  INT DEFAULT 0,
    mmr         INT DEFAULT 0 DEFAULT 1000 CHECK (mmr >= 0),
    high_score  INT DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);