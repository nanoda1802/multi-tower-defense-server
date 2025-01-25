import config from '../../config/configs.js';
import { roomSession } from '../../session/session.js';

/* 매치 종료하고 결과 적용하기 */
const finishMatch = (room, user) => {
  // [1] 매치 결과 기록할 객체 생성
  const matchResult = { winner: '', loser: '' };
  // [2] 플레이어 별로 결과 적용
  room.players.forEach((player, playerId) => {
    // [2-1] 승패 판정 (패배한 user가 호출하게 됨)
    const isWin = playerId === user.id ? false : true;
    if (isWin) matchResult.winner = playerId;
    else matchResult.loser = playerId;
    // [2-2] gameOverNotification 패킷 만들어 전송
    player.user.sendPacket(config.packetType.gameOverNotification, { isWin });
    // [2-3] 전적 및 최고 기록 최신화
    player.user.updateMatchRecord(isWin, player.score);
  });
  // [3] 각 유저 mmr 최신화
  room.updateMmr(matchResult);
  // [4] 룸 세션에서 매치 종료된 룸 제거
  roomSession.deleteRoom(room.id);
};

export default finishMatch;
