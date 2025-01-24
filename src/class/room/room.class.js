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
      this.players.set(user.id, new Player(user.id, user.socket, this.id));
    }
    finishMatchHandler(this);
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

  // 핸들러에서 페이로드랑 타입을 만들어줘야하고
  // 양쪽 아이디도 알아내서 넣어줘야

  // userInfos = [{id,payload,type},{id,payload,type}]
  notify(userInfos) {
    for (const info of userInfos) {
      this.players.getPlayer(info.id).user.sendPacket(info.type, info.payload);
    }
  }
}

export default Room;
