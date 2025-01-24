import makePacketBuffer from '../../utils/send-packet/makePacket.js';
import { roomSession, userSession } from '../../session/session.js';
import config from '../../config/configs.js';

export const killMonsterHandler = (socket, payload) => {
  // [1] 페이로드에서 데이터 꺼내기
  const { monsterId } = payload;
  // [2] 플레이어 찾기
  const user = userSession.getUser(socket);
  const room = roomSession.getRoom(user.roomId);
  const player = room.getPlayer(user.id);
  // [3] 몬스터 사망 처리
  player.killMonster(monsterId);
  // [4] 상대방 클라이언트에 정보 보내기
  room.players.forEach((player) => {
    if (player.id === user.id) {
      return;
    }
    const packet = makePacketBuffer(config.packetType.enemyMonsterDeathNotification, 0, {
      monsterId,
    });
    player.socket.write(packet);
  });
};

/* 
message C2SMonsterDeathNotification {
    int32 monsterId = 1;
}

message S2CEnemyMonsterDeathNotification {
    int32 monsterId = 1;
}
    내 클라이언트에서 몬스터 사망 처리시, 상대방 클라이언트에서도 사망처리
    */

//killMonster(monsterId) => state = 'alive' => 'dead' 로 바꿔줌
