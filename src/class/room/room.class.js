import Player from '../in-game/player.class.js';
import EloRank from 'elo-rank';
import config from '../../config/configs.js';

/* 필요 환경변수 꺼내오기 */
const { packetType } = config;

/* EloRank 인스턴스 생성 */
const elo = new EloRank(10); // 10은 mmr 변동 최대치, default 값은 32임

/* Room 클래스 */
class Room {
  constructor(roomId, users) {
    this.id = roomId;
    this.monsterLevel = 1; // 10 마리 스폰될 때마다 1씩 증가
    this.monsterId = 1; // 개별 몬스터 식별자
    this.towerId = 1; // 개별 타워 식별자
    this.players = new Map();
    this.setPlayers(users); // 룸 생성과 동시에 플레이어 참여시킴
  }

  /* 룸에 플레이어 참가시키는 메서드 */
  setPlayers(users) {
    // [1] 두 명의 User 인스턴스 분해 할당
    const [userA, userB] = users;
    // [2] 유저들의 roomId 갱신
    userA.enterRoom(this.id);
    userB.enterRoom(this.id);
    // [3] 유저들 각각의 Player 인스턴스 생성해 룸에 투입
    this.players.set(userA.id, new Player(userA, userB.id));
    this.players.set(userB.id, new Player(userB, userA.id));

    /* 밑은 기존 코드 */
    // for (let user of users) {
    //   user.enterRoom(this.id);
    //   this.players.set(user.id, new Player(user.id, user.socket, this.id, user));
    // }
    // finishMatchHandler(this);
  }

  /* 룸 비우는 메서드 */
  clearRoom() {
    // [1] 소속 유저들 roomId 초기화 및 유저들의 state를 "Waiting"으로 변경
    for (const player of this.players.values()) {
      player.user.roomId = null;
      player.user.waiting();
    }
    // [2] Map 인스턴스 초기화
    this.players.clear();
  }

  /* 특정 플레이어 조회하는 메서드 */
  getPlayer(id) {
    return this.players.get(id);
  }

  /* monsterLevel 증가시키는 메서드 */
  increaseLevel() {
    // [1] 몬스터 레벨 증가시킴
    this.monsterLevel += 1;
    // [2] 각 플레이어의 타워들 레벨에 맞게 강화
    const [playerA, playerB] = [...this.players.values()];
    playerA.intensifyTowers(this.monsterLevel);
    playerB.intensifyTowers(this.monsterLevel);
  }

  /* 몬스터 식별자 반환한 후 1 증가시키는 메서드 */
  getMonsterId() {
    return this.monsterId++;
  }

  /* 타워 식별자 반환한 후 1 증가시키는 메서드 */
  getTowerId() {
    return this.towerId++;
  }

  /* mmr 최신화하기 */
  updateMmr(matchResult) {
    // [1] 승리 유저와 패배 유저 구분
    const winner = matchResult.winner;
    const loser = matchResult.loser;
    // [2] 각각의 예상 승리 확률 계산
    const winProbability = {
      winner: elo.getExpected(winner.mmr, loser.mmr),
      loser: elo.getExpected(loser.mmr, winner.mmr),
    };
    // [3] 예상 승리 확률과 실제 승패를 바탕으로 각각의 mmr 갱신
    winner.mmr = elo.updateRating(winProbability.winner, 1, winner.mmr); // 1은 실제로 승리했다는 의미
    loser.mmr = elo.updateRating(winProbability.loser, 0, loser.mmr); // 0은 실제로 패배했다는 의미, 참고로 0.5는 비겼다는 의미
  }

  /* 플레이어들에게 패킷 보내기 */
  sendNotification(player, requestType, properties) {
    // [1] request 보낸 플레이어와 상대 플레이어의 유저 인스턴스 구분
    const me = player.user;
    const opponent = this.players.get(player.opponentId).user;
    // [2] 동적으로 할당할 payload와 responseType 설정
    let payload = null;
    let responseType = null;
    // [3] request의 패킷타입으로 분기 구분
    switch (requestType) {
      // [3 A] attackBaseHandler 시점, properties는 { baseHp }
      case packetType.monsterAttackBaseRequest:
        payload = {
          me: { isOpponent: false, ...properties },
          opponent: { isOpponent: true, ...properties },
        };
        responseType = {
          me: packetType.updateBaseHpNotification,
          opponent: packetType.updateBaseHpNotification,
        };
        break;
      // [3 B] killMonsterHandler 시점, properties는 { monsterId }
      case packetType.monsterDeathNotification:
        payload = { me: player.makeSyncPayload(), opponent: properties };
        responseType = {
          me: packetType.stateSyncNotification,
          opponent: packetType.enemyMonsterDeathNotification,
        };
        break;
      // [3 C] spawnMonsterHandler 시점, properties는 { monsterId, monsterNumber }
      case packetType.spawnMonsterRequest:
        payload = { me: properties, opponent: properties };
        responseType = {
          me: packetType.spawnMonsterResponse,
          opponent: packetType.spawnEnemyMonsterNotification,
        };
        break;
      // [3 D] attackMonsterHandler 시점, properties는 { towerId, monsterId }
      case packetType.towerAttackRequest:
        payload = { opponent: properties };
        responseType = {
          opponent: packetType.enemyTowerAttackNotification,
        };
        break;
      // [3 E] purchaseTowerHandler 시점, properties는 { towerId, x, y }
      case packetType.towerPurchaseRequest:
        payload = { me: { towerId: properties.towerId }, opponent: properties };
        responseType = {
          me: packetType.towerPurchaseResponse,
          opponent: packetType.addEnemyTowerNotification,
        };
        break;
      // [3 F] 정의되지 않은 요청이거나, 매개변수 값이 잘못된 경우
      default:
        console.log(`알 수 없는 요청 타입 : ${requestType}`);
        return;
    }
    // [4] 본인과 상대에게 각각 적절한 패킷 보냄
    opponent.sendPacket(responseType.opponent, payload.opponent);
    if (responseType.me) me.sendPacket(responseType.me, payload.me);
  }

  /* 아래는 기존 코드들 */
  // broadcastOthers(packetType, payload, id) {
  //   this.users.forEach((user) => {
  //     if (user.id !== id) {
  //       user.sendPacket(packetType, payload);
  //     }
  //   });
  // }

  // broadcast(packetType, payload) {
  //   this.users.forEach((user) => {
  //     user.sendPacket(packetType, payload);
  //   });
  // }

  // notify(userInfos) {
  //   for (const info of userInfos) {
  //     this.players.getPlayer(info.id).user.sendPacket(info.type, info.payload);
  //   }
  // }

  // getUser(id) {
  //   return this.users.get(id);
  // }

  // getMonsterId() {
  //   if (this.monsterId % 10 === 0) {
  //     this.monsterLevel++;
  //     this.players.forEach((player) =>
  //       player.towers.forEach((tower) => tower.setLevel(this.monsterLevel)),
  //     );
  //   }
  //   return this.monsterId++;
  // }
}

export default Room;
