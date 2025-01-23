import pools from '../pools.js';
import USER_SQL_QUERIES from './user.queries.js';

const insertUserData = async (id, password, email) => {
  const connection = await pools.USER_DB.getConnection();
  await connection.beginTransaction();
  await connection.execute(USER_SQL_QUERIES.INSERT_USER, [id, password, email]);
  await connection.execute(USER_SQL_QUERIES.INSERT_DEFAULT_RANK, [id]);
  await connection.commit();
};

const selectUserData = async (id) => {
  const [user] = await pools.USER_DB.execute(USER_SQL_QUERIES.SELECT_USER, [id]);
  return user[0];
};

export { insertUserData, selectUserData };
