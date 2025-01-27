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
  try {
    // [1] 유저 정보와 랭크 정보 가져오기
    const [user] = await pools.USER_DB.execute(USERS_QUERIES.SELECT_USER, [id]);
    return user[0];
  } catch (error) {
    // [2] 실패 시 에러 객체 상위 함수로 전달
    throw error;
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
    // [3-1] 쿼리 도중 오류 발생 시 트랜잭션 롤백
    await connection.rollback();
    // [3-2] 에러 객체 상위 함수로 전달
    throw error;
  } finally {
    // [4] 성공하든 실패하든 다 쓴 연결 풀로 복귀
    connection.release();
  }
};

export { insertUserData, selectUserData, updateUserData };
