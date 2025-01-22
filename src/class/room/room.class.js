import Player from '../in-game/player.class';

class Room {
  constructor(id, users) {
    this.id = id;
    // 상수들 입니다
    this.baseHp = 10;
    this.towerCost = 10;
    this.initialGold = 10;
    this.monsterSpawnInterval = 1;

    this.monsters = new Map();
    this.towers = new Map();
    this.players = new Map();
    setPlayers(users);
  }

  // 플레이어 관련
  setPlayers(users) {
    for (let user of users) {
      this.players.set(user.socket, new Player(user.id, user.socket, this.id, user.sequn));
    }
  }

  getPlayer(socket) {
    if (this.players[socket] !== undefined) {
      return this.players[socket];
    }
  }

  getInitData() {
    return {
      baseHp: this.baseHp,
      towerCost: this.towerCost,
      initialGold: this.initialGold,
      monsterSpawnInterval: this.monsterSpawnInterval,
    };
  }

  // 몬스터
  setMonster() {}

  getMonster() {}

  deleteMonster() {}
  // 타워
  setTower() {}

  getTower() {}

  deleteTower() {}
}

export default Room;
