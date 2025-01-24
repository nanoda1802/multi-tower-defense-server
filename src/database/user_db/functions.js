import pools from '../pools.js';
import USER_SQL_QUERIES from './queries.js';

/* 회원가입 시 실행하는 쿼리 함수 */
const insertUserData = async (id, password, email) => {
  // [1] 커넥션 풀에서 연결 하나 꺼내오기
  const connection = await pools.USER_DB.getConnection();
  // [2] 트랜잭션 트라이하기 (users 테이블과 ranks 테이블에 데이터 같이 넣기 위함)
  try {
    await connection.beginTransaction();
    await connection.execute(USER_SQL_QUERIES.INSERT_USER, [id, password, email]);
    await connection.execute(USER_SQL_QUERIES.INSERT_DEFAULT_RANK);
    // [3 A] 트랜잭션이 무사히 끝나면 쿼리 완료 알리기
    await connection.commit();
  } catch (error) {
    // [3 B] 트랜잭션 실패 시 롤백하고, 에러 객체 상위 함수로 전달
    await connection.rollback();
    throw error;
  } finally {
    // [4] 아무튼 쿼리가 종료됐으면 사용한 연결을 풀에 돌려주기
    connection.release();
  }
};

/* 로그인 시 실행하는 쿼리 함수 */
const selectUserData = async (id) => {
  try {
    // [1] 유저 정보와 랭크 정보 가져오기
    const [user] = await pools.USER_DB.execute(USER_SQL_QUERIES.SELECT_USER_WITH_RANK, [id]);
    return user[0];
  } catch (error) {
    // [2] 실패 시 에러 객체 상위 함수로 전달
    throw error;
  }
};

export { insertUserData, selectUserData };
