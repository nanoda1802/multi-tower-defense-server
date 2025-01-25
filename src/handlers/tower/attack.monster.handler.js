import config from '../../config/configs.js';
import makePacketBuffer from '../../utils/send-packet/makePacket.js';
import { roomSession, userSession } from '../../session/session.js';

const attackMonsterHandler = (socket, payload) => {
  const { towerId, monsterId } = payload;

  // 세션<>입력 검증 과정
  const user = userSession.getUser(socket);
  if (!user) return;
  const room = roomSession.getRoom(user.roomId);
  if (!room) return;
  const player = room.getPlayer(user.id);
  if (!player) return;
  const monster = player.getMonster(monsterId);
  if (!monster) return;
  const tower = player.getTower(towerId);
  if (!tower) return;

  // 공격 판정 성공 시
  if (tower.attackMonster(monster))
    room.players.forEach((player) => {
      // 자신을 제외한 상대에게 티워 공격 정보 반환
      if (player.user.id === user.id) return;
      const packet = makePacketBuffer(config.packetType.enemyTowerAttackNotification, 0, {
        towerId,
        monsterId,
      });
      player.user.socket.write(packet);
    });
};

export default attackMonsterHandler;
