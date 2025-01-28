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
  // [2] 기존 execute 메서드 개편
  const originalQuery = pool.execute;
  // [2-1] 어떤 쿼리가 언제 실행됐는지 콘솔이 출력되도록 수정
  pool.execute = (sql, params) => {
    const date = new Date();
    console.log(`${date}에 실행된 쿼리 : ${sql}`);
    console.log(`쿼리의 매개변수 : ${params ? `${JSON.stringify(params)}` : `none`}`);
    return originalQuery.call(pool, sql, params);
  };
  // [3] 생성한 커넥션 풀 반환
  return pool;
};

export default createPool;
