import startMatch from '../../utils/match/start.match.js';
import Player from '../in-game/player.class.js';
import EloRank from 'elo-rank';

/* EloRank 인스턴스 생성 */
// Elo는 이 레이팅 시스템 개발하신 학자 성함이래여
const elo = new EloRank(10); // 10은 mmr 변동 최대치, default 값은 32임

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

  /* 룸에 플레이어 참가시키기 */
  setPlayers(users) {
    // [1] 두 명의 User 인스턴스 분해 할당
    const [userA, userB] = users;
    // [2] 유저들에게 roomId 값 넣어줌
    userA.enterRoom(this.id);
    userB.enterRoom(this.id);
    // [3] 유저들 각각의 Player 인스턴스 생성해 룸에 투입
    this.players.set(userA.id, new Player(userA, userB.id));
    this.players.set(userB.id, new Player(userB, userA.id));
    // [3] 매치 시작 핸들러 실행
    startMatch(this);
    /* 밑은 기존 코드 */
    // for (let user of users) {
    //   user.enterRoom(this.id);
    //   this.players.set(user.id, new Player(user.id, user.socket, this.id, user));
    // }
    // finishMatchHandler(this);
  }

  /* 룸 비우기 */
  clearRoom() {
    // [1] 소속 유저들 roomId 초기화
    for (const player of this.players.values()) {
      player.user.roomId = null;
    }
    // [2] Map 인스턴스 초기화
    this.players.clear();
  }

  getUser(id) {
    return this.users.get(id);
  }

  getPlayer(id) {
    return this.players.get(id);
  }

  getMonsterId() {
    if (this.monsterId % 10 === 0) {
      this.monsterLevel++;
      this.players.forEach((player) =>
        player.towers.forEach((tower) => tower.setLevel(this.monsterLevel)),
      );
    }
    return this.monsterId++;
  }

  getTowerId() {
    return this.towerId++;
  }

  /* mmr 최신화하기 */
  updateMmr(matchResult) {
    // [1] 승리 유저와 패배 유저 구분
    const winner = this.players.get(matchResult.winner).user;
    const loser = this.players.get(matchResult.loser).user;
    // [2] 각각의 예상 승리 확률 계산
    const winProbability = {
      winner: elo.getExpected(winner.mmr, loser.mmr),
      loser: elo.getExpected(loser.mmr, winner.mmr),
    };
    // [3] 예상 승리 확률과 실제 승패를 바탕으로 각각의 mmr 최신화
    winner.mmr = elo.updateRating(winProbability.winner, 1, winner.mmr); // 1은 실제로 승리했다는 의미
    loser.mmr = elo.updateRating(winProbability.loser, 0, loser.mmr); // 0은 실제로 패배했다는 의미, 참고로 0.5는 비겼다는 의미
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
