import finishMatchHandler from '../../handlers/match/finish.match.handler';
import Player from '../in-game/player.class';

class Room {
  constructor(id, users) {
    this.id = id;

    // 변수들 입니다.
    this.roomLevel = 0;
    this.monsterId = 0;
    this.towerId = 0;

    // this.monsters = new Map();
    // this.towers = new Map();
    this.players = new Map();
    setPlayers(users);
  }

  // 플레이어 관련
  setPlayers(users) {
    for (let user of users) {
      user.enterRoom(this.id);
      this.players.set(user.socket, new Player(user.id, user.socket, this.id));
    }
    finishMatchHandler(this);
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
  getMonsterId() {
    return this.monsterId++;
  }
  getTowerId() {
    return this.towerId++;
  }
  // // 몬스터
  // setMonster(monsterId, Rcode, userId) {
  //   const monster = new Monster(monsterId, this.monsterId, this.roomLevel, Rcode, userId);
  //   this.monsters.set(this.monsterId, monster);
  //   this.monsterId++;
  // }

  // getMonster(monsterId) {
  //   if (this.monsters[monsterId] !== undefined) {
  //     return this.monsters[monsterId];
  //   }
  // }

  // deleteMonster(monsterId) {
  //   if (this.monsters[monsterId] !== undefined) {
  //     this.monsters.delete(monsterId);
  //   }
  // }

  // // 타워
  // setTower(x, y, Rcode, userId) {
  //   const tower = new Tower(this.towerId, x, y, Rcode, userId);
  //   this.towers.set(this.towerId, tower);
  //   this.towerId++;
  // }

  // getTower(towerId) {
  //   if (this.towers[towerId] !== undefined) {
  //     return this.towers[towerId];
  //   }
  // }

  // deleteTower(towerId) {
  //   if (this.towers[towerId] !== undefined) {
  //     this.towers.delete(towerId);
  //   }
  // }
}

export default Room;
