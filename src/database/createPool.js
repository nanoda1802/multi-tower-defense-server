import mysql from 'mysql2/promise';

/* 커넥션 풀 생성 함수 */
const createPool = (envConfig) => {
  // [1] 커넥션 풀 생성
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
  // [3] 생성한 커넥션 풀 반환
  return pool;
};

export default createPool;
