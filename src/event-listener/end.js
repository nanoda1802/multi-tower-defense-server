import { roomSession, userSession, waitingQueue } from '../session/session.js';
import { updateUserData } from '../database/user_db/functions.js';
import config from '../config/configs.js';

const { userState } = config;

const onEnd = (socket) => async () => {
  // [1] 접속 종료한 유저 검색
  const user = userSession.getUser(socket);
  console.log(`클라 접속 종료!! : ${user.id}`);
  // [2] 만약 로비 화면이 아닐 시 처리
  if ((user.state = userState.matchMaking)) {
    // [2 A] 매치메이킹 도중 종료 시 대기열에서 제외
    waitingQueue.dequeueUser(user);
  } else if ((user.state = userState.playing)) {
    // [2 B] 게임 도중 종료 시 승패 판정 후 매치 결과 적용 후 룸 제거
    const room = roomSession.getRoom(user.roomId);
    roomSession.finishMatch(room, user);
  }
  // [3] 유저 세션에서 해당 유저 제거
  userSession.deleteUser(socket);
  // [4] 소켓 제거
  socket.end();
  socket.destroy();
};

export default onEnd;
