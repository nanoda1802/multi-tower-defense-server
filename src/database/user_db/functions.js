import pools from '../pools.js';
import USERS_QUERIES from './queries.js';

/* 회원가입 시 실행하는 쿼리 함수 */
const insertUserData = async (id, password, email) => {
  try {
    // [1] 가입 정보 저장하기
    await pools.USER_DB.execute(USERS_QUERIES.INSERT_USER, [id, password, email]);
  } catch (error) {
    // [2] 실패 시 에러 객체 상위 함수로 전달
    throw error;
  }
};

/* 로그인 시 실행하는 쿼리 함수 */
const selectUserData = async (id) => {
  // [1] 풀에서 연결 하나 꺼내옴
  const connection = await pools.USER_DB.getConnection();
  try {
    // [2] 트랜잭션 시작
    await connection.beginTransaction();
    await connection.execute(USERS_QUERIES.SET_ISOLATION);
    // [3] 유저 정보와 랭크 정보 가져오기
    const [user] = await connection.execute(USERS_QUERIES.SELECT_USER, [id]);
    // [4] 트랜잭션 종료
    await connection.commit();
    // [5] 요청받은 아이디에 해당하는 유저 데이터 반환
    return user[0];
  } catch (error) {
    // [4-1] 트랜잭션 도중 오류 발생 시 롤백
    await connection.rollback();
    // [4-2] 실패 시 에러 객체 상위 함수로 전달
    throw error;
  } finally {
    // [6] 성공하든 실패하든 사용 마친 연결 풀로 복귀시킴
    connection.release();
  }
};

/* 게임 종료 시 실행하는 쿼리 함수 */
const updateUserData = async (userA, userB) => {
  // [1] 풀에서 연결 하나 꺼내옴
  const connection = await pools.USER_DB.getConnection();
  try {
    // [2] 트랜잭션 시작
    await connection.beginTransaction();
    // [2-1] 유저A 업데이트
    await connection.execute(USERS_QUERIES.UPDATE_USER, [
      userA.matchRecord.win,
      userA.matchRecord.lose,
      userA.mmr,
      userA.highScore,
      userA.key,
    ]);
    // [2-2] 유저B 업데이트
    await connection.execute(USERS_QUERIES.UPDATE_USER, [
      userB.matchRecord.win,
      userB.matchRecord.lose,
      userB.mmr,
      userB.highScore,
      userB.key,
    ]);
    // [3] 트랜잭션 종료
    await connection.commit();
  } catch (error) {
    // [4-1] 트랜잭션 도중 오류 발생 시 롤백
    await connection.rollback();
    // [4-2] 에러 객체 상위 함수로 전달
    throw error;
  } finally {
    // [5] 성공하든 실패하든 사용 마친 연결 풀로 복귀시킴
    connection.release();
  }
};

export { insertUserData, selectUserData, updateUserData };
