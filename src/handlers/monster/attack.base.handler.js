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
  const baseHp = player.base.getHp()
  if (baseHp <= 0) {
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
  // 게임오버가 아닐 시 baseHp 업데이트 전송
  } else {
    // 피격된 base hp 동기화 
    room.players.forEach((player) => {
      // player가 누구인지에 따라 isOpponent 조정
      let isOpponent
      if (player.playerId === user.id) isOpponent = false
      else isOpponent = true
      // 패킷 생성 후 전달
      const packet = makePacketBuffer(config.packetType.updateBaseHpNotification, { isOpponent, baseHp })
      player.socket.write(packet)
    })
  }
};

export default attackBaseHandler;
