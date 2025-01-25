import config from '../../config/configs.js';
import makePacketBuffer from '../../utils/send-packet/makePacket.js';
import { roomSession, userSession } from '../../session/session.js';

const attackBaseHandler = (socket, payload) => {
  // 세션<>입력 검증 과정
  const user = userSession.getUser(socket);
  if (!user) return;
  const room = roomSession.getRoom(user.roomId);
  if (!room) return;
  const player = room.getPlayer(user.id);
  if (!player) return;

  // 데미지 적용
  player.base.damaged(payload.damage);

  // base 체력으로 게임오버 여부 확인
  const baseHp = player.base.getHp();
  if (baseHp <= 0) {
    /* 게임오버 판정하기 */
    // [1] 승패 판정 후 전적 최신화
    const matchResult = { winner: '', loser: '' };
    room.players.forEach((player, playerId) => {
      // [1-1] 승패 판정 (베이스가 주근 player가 본인이라면 패배)
      const isWin = playerId === user.id ? false : true;
      if (isWin) matchResult.winner = playerId;
      else matchResult.loser = playerId;
      // [1-2] gameOverNotification 패킷 만들어 전송
      player.user.sendPacket(config.packetType.gameOverNotification, { isWin });
      // [1-3] 전적 최신화
      player.user.updateMatchRecord(isWin);
    });
    // [2] 각 유저 mmr 최신화
    room.updateMmr(matchResult);
    // [3] 룸 세션에서 매치 종료된 룸 제거
    roomSession.deleteRoom(room.id);
    /* 밑은 기존 코드 */
    // 게임 오버 시 종료 시점을 클라이언트들에게 전달
    // room.players.forEach((player) => {
    //   let packet;
    //   // player가 자신일 경우 패배, 상대방일 경우 승리 정보를 반환
    //   if (player.id === user.id)
    //     packet = makePacketBuffer(config.packetType.gameOverNotification, 0, { isWin: false });
    //   else packet = makePacketBuffer(config.packetType.gameOverNotification, 0, { isWin: true });
    //   player.socket.write(packet);
    // });
    // 게임오버가 아닐 시 baseHp 업데이트 전송
  } else {
    // 피격된 base hp 동기화
    room.players.forEach((player) => {
      // player가 누구인지에 따라 isOpponent 조정
      let isOpponent;
      if (player.user.id === user.id) isOpponent = false;
      else isOpponent = true;
      // 패킷 생성 후 전달
      const packet = makePacketBuffer(config.packetType.updateBaseHpNotification, 0, {
        isOpponent,
        baseHp,
      });
      player.user.socket.write(packet);
    });
  }
};

export default attackBaseHandler;
