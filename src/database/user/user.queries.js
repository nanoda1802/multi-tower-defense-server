export const USER_SQL_QUERIES = {
  CREATE_USER: 'INSERT INTO user (id, password,email) VALUES (?, ?,?)',
  CREATE_RANK: 'INSERT INTO ranks (user_key, win_count, lose_count, mmr) VALUES (?, 0, 0, 0)',
};
