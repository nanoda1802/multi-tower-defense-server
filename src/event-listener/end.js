import { roomSession, userSession, waitingQueue } from '../session/session.js';
import { updateUserData } from '../database/user_db/functions.js';
import config from '../config/configs.js';

/* 필요한 환경변수 가져오기 */
const { userState } = config;

/* End 이벤트 리스너 */
const onEnd = (socket) => async () => {
  // [1] 접속 종료한 유저 검색
  const user = userSession.getUser(socket);
  console.log(`클라 접속 종료!! : ${user.id}`);
  // [2] 유저가 "waiting" 상태가 아닐 때의 처리들
  if (user.state === userState.matchMaking) {
    // [2 A] 매치메이킹 도중 종료 시 대기열에서 제외
    waitingQueue.dequeueUser(user);
  } else if (user.state === userState.playing) {
    // [2 B] 게임 진행중 종료 시 해당 게임 종료 처리
    const room = roomSession.getRoom(user.roomId);
    await roomSession.finishGame(room, user);
  }
  // [3] 유저 세션에서 해당 유저 제거
  userSession.deleteUser(socket);
  // [4] 해당 클라이언트와 연결된 소켓 종료 및 제거
  socket.end();
  socket.destroy();
};

export default onEnd;
