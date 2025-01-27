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
const updateUserData = async (winCount, loseCount, mmr, highScore, userKey) => {
  try {
    // const connection = pools.USER_DB.getConnection();
    // await connection.beginTransaction;

    // [1] 게임 진행 정보 최신화하기
    await pools.USER_DB.execute(USERS_QUERIES.UPDATE_USER, [
      winCount,
      loseCount,
      mmr,
      highScore,
      userKey,
    ]);
  } catch (error) {
    // [2] 실패 시 에러 객체 상위 함수로 전달
    throw error;
  }
};

export { insertUserData, selectUserData, updateUserData };
