import { roomSession, userSession } from '../session/session.js';
import { updateUserData } from '../database/user_db/functions.js';
import finishMatch from '../utils/match/finish.match.js';

const onEnd = (socket) => async () => {
  // [1] 접속 종료한 유저 검색
  const user = userSession.getUser(socket);
  console.log(`클라 접속 종료!! : ${user.id}`);
  // [2] 만약 매치가 진행 중일 시 처리
  if (user.roomId) {
    // [2-1] 진행 중인 룸 검색
    const room = roomSession.getRoom(user.roomId);
    // [2-2] 승패 판정 후 gameOverNotification 보내고 매치 결과 적용 후 룸 제거
    finishMatch(room, user);
  }
  // [3] 전적과 mmr, 하이스코어 데이터베이스에 저장
  try {
    await updateUserData(
      user.matchRecord.win,
      user.matchRecord.lose,
      user.mmr,
      user.highScore,
      user.key,
    );
  } catch (error) {
    console.error(`로그아웃 처리 중 문제 발생!! `, error);
  }
  // [4] 유저 세션에서 해당 유저 제거
  userSession.deleteUser(socket);
  // [5] 소켓 제거
  socket.end();
  socket.destroy();
};

export default onEnd;
