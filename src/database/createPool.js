import mysql from 'mysql2/promise';

const createPool = (envConfig) => {
  const pool = mysql.createPool({
    host: envConfig.db1Host,
    port: envConfig.db1Port,
    user: envConfig.db1User,
    password: envConfig.db1Password,
    database: envConfig.db1Name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const originalQuery = pool.execute;

  pool.execute = (sql, params) => {
    const date = new Date();
    console.log(`${date}에 실행된 쿼리 : ${sql}`);
    console.log(`쿼리의 매개변수 : ${params ? `${JSON.stringify(params)}` : `none`}`);
    return originalQuery.call(pool, sql, params);
  };

  return pool;
};

export default createPool;
