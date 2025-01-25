const USERS_QUERIES = {
  INSERT_USER: `INSERT INTO users (id, password, email) VALUES (?, ?, ?)`,
  SELECT_USER: `SELECT user_key, id, password, win_count, lose_count, mmr, high_score FROM users WHERE id = ?`,
  UPDATE_USER: `UPDATE users SET win_count=?, lose_count=?, mmr =?, high_score=? WHERE user_key=?`,
};

export default USERS_QUERIES;
