import finishMatchHandler from '../../handlers/match/finish.match.handler.js';
import Player from '../in-game/player.class.js';
class Room {
  constructor(id, users) {
    this.id = id;

    // 변수들 입니다.
    this.roomLevel = 0;
    this.monsterId = 1;
    this.towerId = 1;

    this.users = new Map();
    this.players = new Map();
    this.setPlayers(users);
  }

  // 플레이어 관련
  setPlayers(users) {
    for (let user of users) {
      this.users.set(user.id, user);
      user.enterRoom(this.id);
      this.players.set(user.id, new Player(user.id, user.socket, this.id));
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
    return this.monsterId++;
  }

  getTowerId() {
    return this.towerId++;
  }

  broadcast(packet) {
    this.users.forEach((user) => {
      user.send.write(packet);
    });
  }
}

export default Room;
