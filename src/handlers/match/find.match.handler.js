import { userSession, waitingQueue } from '../../session/session.js';

/* 매치 찾기 요청에 대한 핸들러 */
const findMatchHandler = (socket, payload) => {
  // [1] 요청한 유저 조회
  const user = userSession.getUser(socket);
  // [2] 유저가 정상적으로 존재한다면 대기열에 투입
  if (user !== undefined) {
    console.log(`${user.id} 유저의 매치를 찾기 시작합니다.`);
    waitingQueue.enqueueUser(user);
  }
};

export default findMatchHandler;
