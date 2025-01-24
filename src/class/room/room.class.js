import finishMatchHandler from '../../handlers/match/finish.match.handler.js';
import Player from '../in-game/player.class.js';
class Room {
  constructor(id, users) {
    this.id = id;

    // 변수들 입니다.
    this.monsterLevel = 1;
    this.monsterId = 1;
    this.towerId = 1;

    this.players = new Map();
    this.setPlayers(users);
  }
  // 플레이어 관련
  setPlayers(users) {
    for (let user of users) {
      user.enterRoom(this.id);
      this.players.set(user.id, new Player(user.id, user.socket, this.id, user));
    }
    finishMatchHandler(this);
  }

  getUser(id) {
    return this.users.get(id);
  }

  getPlayer(id) {
    return this.players.get(id);
  }

  getMonsterId() {
    const id = this.monsterId++;
    if (id % 10 === 0) {
      this.monsterLevel++;
    }
    return id;
  }

  getTowerId() {
    return this.towerId++;
  }

  broadcastOthers(packetType, payload, id) {
    this.users.forEach((user) => {
      if (user.id !== id) {
        user.sendPacket(packetType, payload);
      }
    });
  }

  broadcast(packetType, payload) {
    this.users.forEach((user) => {
      user.sendPacket(packetType, payload);
    });
  }
  notify(userInfos) {
    for (const info of userInfos) {
      this.players.getPlayer(info.id).user.sendPacket(info.type, info.payload);
    }
  }
}

export default Room;
