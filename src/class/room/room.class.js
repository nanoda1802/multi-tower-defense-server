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
  updateMMR(matchResult) {
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
  notify(infos) {
    for (const info of infos) {
      this.getPlayer(info.id).user.sendPacket(info.packetType, info.payload);
    }
  }
}

export default Room;
