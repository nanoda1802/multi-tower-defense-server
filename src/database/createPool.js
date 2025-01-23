import mysql from 'mysql2/promise';

const createPool = (envConfig) => {
  const pool = mysql.createPool({
    host: envConfig.db1Host,
    port: envConfig.db1Port,
    user: envConfig.db1User,
    password: envConfig.db1Password,
    database: envConfig.db1Name,
    waitForConnections: true, //모자르면 기다린다!
    connectionLimit: 10,
    queueLimit: 10, //얼마나 대기시켜줄지
  });
  const originalQuery = pool.query;

  pool.query = (sql, params) => {
    const date = new Date();
    // 쿼리 실행시 로그
    console.log(
      `[${date.getFullYear()}] Executing query: ${sql} ${params ? `, ${JSON.stringify(params)}` : ``}`,
    );
    return originalQuery.call(pool, sql, params);
  };

  return pool;
};
export default createPool;
