import config from '../../config/configs.js';
import { userSession } from '../../session/session.js';
import makePath from '../../utils/path/make.monster.path.js';
import makePacketBuffer from '../../utils/send-packet/makePacket.js';
import { makeBaseData, makeGameState, makeInitialGameState } from '../../utils/send-packet/payload/game.data.js';
import { makeMatchStartNotification } from '../../utils/send-packet/payload/notification/game.notification.js';

const finishMatchHandler = (room) => {
  let monsterPath = {};
  let playerData = {}
  const playerId = [];
  //초기값
  const initialGameState = makeInitialGameState(
    config.game.baseHp,
    config.game.towerCost,
    config.game.initialGold,
    config.game.monsterSpawnInterval,
  );
  
  //길만들기 // 객체 형태로 관리해 달라고 요청 하기.
  room.players.forEach((player) => {
    monsterPath[player.id] = makePath(5)
    playerData[player.id] = makeGameState(
      player.gold,
      makeBaseData(player.base.hp, player.base.maxHp),
      player.highScore,
      [],
      [],
      room.roomLevel,
      player.score,
      monsterPath[player.id],
      monsterPath[player.id][monsterPath[player.id].length - 1],
    );
    playerId.push(player.id)
  })

  // 전달
  room.players.forEach((player) => {
    const S2CMatchStartNotification = makeMatchStartNotification(
      initialGameState,
      playerData[player.id],
      playerData[playerId.find((e) => e !== player.id)],
    );

    const packet = makePacketBuffer(
      config.packetType.matchStartNotification,
      userSession.getUser(player.socket).sequence,
      S2CMatchStartNotification,
    );

    player.socket.write(packet);
  })

};

export default finishMatchHandler;
