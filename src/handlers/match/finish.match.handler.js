import config from '../../config/configs.js';

const finishMatchHandler = (room) => {
  const InitialData = {
    baseHp: room.baseHp,
    towerCost: room.towerCost,
    initialGold: config.initialGold,
    monsterSpawnInterval: room.monsterSpawnInterval,
  };
  const playerData = {
    gold: player.gold,
    base: player.base,
    highScore: 0,
    towers: room.towers,
    monsters: room.monsters,
    monsterLevel: room.roomLevel,
    score: player.score,
    monsterPath,
    basePosition,
  };

  for (let targetPlayer of room.players.values) {
    for (let player of room.players.values) {
      if (targetPlayer.userId === player.userId) {
        continue;
      }
    }
  }
};

export default finishMatchHandler;
