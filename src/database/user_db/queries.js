const USER_SQL_QUERIES = {
  INSERT_USER: `INSERT INTO users (id, password, email) VALUES (?, ?, ?)`,
  SELECT_USER: `SELECT user_key, id, password, win_count, lose_count, mmr, high_score FROM users WHERE id = ?`,
};

export default USER_SQL_QUERIES;
