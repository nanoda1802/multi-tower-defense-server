CREATE TABLE IF NOT EXISTS Users
(
    `key`       INT PRIMARY KEY,
    id          VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Ranks
(
    user_key    INT UNIQUE NOT NULL,
    win_count   INT DEFAULT 0,
    lose_count  INT DEFAULT 0,
    mmr         INT DEFAULT 0,
    high_score  INT DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_key) REFERENCES Users(`key`) ON DELETE CASCADE
);