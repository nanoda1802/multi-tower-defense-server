const USER_SQL_QUERIES = {
  INSERT_USER: `INSERT INTO users (id, password, email) VALUES (?, ?, ?)`,
  INSERT_DEFAULT_RANK: 'INSERT INTO ranks (user_key) VALUES (LAST_INSERT_ID())',
  SELECT_USER_WITH_RANK: `SELECT u.key, u.id, u.password, r.win_count, r.lose_count, r.mmr, r.high_score FROM users AS u INNER JOIN ranks AS r ON u.key = r.user_key WHERE u.id = ?`,
};

export default USER_SQL_QUERIES;
