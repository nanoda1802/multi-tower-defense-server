import { userSession, waitingQueue } from '../../session/session.js';

/* 매치 찾기 요청에 대한 핸들러 */
const findMatchHandler = (socket, payload) => {
  // [1] 요청한 유저 조회
  const user = userSession.getUser(socket);
  // [2] 유저가 정상적으로 존재한다면 대기열에 투입
  if (user !== undefined) {
    console.log(`유저 매칭 대기 시작! : ${user.id}`);
    waitingQueue.enqueueUser(user);
  }
};

export default findMatchHandler;
