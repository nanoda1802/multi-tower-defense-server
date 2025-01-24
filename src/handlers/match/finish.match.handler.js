import config from '../../config/configs.js';
import makePath from '../../utils/path/make.monster.path.js';
import makePacketBuffer from '../../utils/send-packet/makePacket.js';
import { makeGameState, makeInitialGameState } from '../../utils/send-packet/payload/game.data.js';
import { makeMatchStartNotification } from '../../utils/send-packet/payload/notification/game.notification.js';

const finishMatchHandler = (room) => {
  console.log("매칭 성공 보내기")
  //초기값
  const initialGameState = makeInitialGameState(
    config.game.baseHp,
    config.game.towerCost,
    config.game.initialGold,
    config.game.monsterSpawnInterval,
  );
  //길만들기 // 객체 형태로 관리해 달라고 요청 하기.

  for (let targetPlayer of room.players.values()) {
    const monsterPath = makePath(2);
    //타겟인 플레이어 데이터
    //플레이어 쪽에서 score어랑 highscore 관리 해주기 요청
    const playerData = makeGameState(
      targetPlayer.gold,
      targetPlayer.base,
      targetPlayer.highScore,
      targetPlayer.towers,
      targetPlayer.monsters,
      room.roomLevel,
      targetPlayer.score,
      monsterPath,
      monsterPath[monsterPath.length - 1],
    );
    let opponentData = {};
    for (let player of room.players.values()) {
      if (targetPlayer.id === player.id) {
        continue;
      }
      // 다른 사람 데이터
      opponentData = makeGameState(
        player.gold,
        player.base,
        player.highScore,
        player.towers,
        player.monsters,
        room.roomLevel,
        player.score,
        monsterPath,
        monsterPath[monsterPath.length - 1],
      );
    }
    const S2CMatchStartNotification = makeMatchStartNotification(
      initialGameState,
      playerData,
      opponentData,
    );
    const packet = makePacketBuffer(
      config.packetType.matchStartNotification,
      S2CMatchStartNotification,
    );
    targetPlayer.socket.write(packet);
  }
};

export default finishMatchHandler;
