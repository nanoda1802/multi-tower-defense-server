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
  // 게임오버 여부 확인
  if(player.base.gameOver) {
    // 게임 오버 시 종료 시점을 클라이언트들에게 전달
    room.players.forEach((player) => {
      let packet
      // player가 자신일 경우 패배, 상대방일 경우 승리 정보를 반환
      if (player.playerId === user.id)
        packet = makePacketBuffer(config.packetType.gameOverNotification, { isWin: false })
      else
        packet = makePacketBuffer(config.packetType.gameOverNotification, { isWin: true })
      player.socket.write(packet)
    })
  }
};

export default attackBaseHandler;
