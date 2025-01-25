import { userSession, waitingQueue } from '../../session/session.js';

const findMatchHandler = (socket, payload) => {
  const user = userSession.getUser(socket);
  if (user !== undefined) {
    console.log("매칭에 집어넣음")
    // 유저 찾아서 대기열에 넣어주기
    waitingQueue.addQueue(user);
  }
};

export default findMatchHandler;
