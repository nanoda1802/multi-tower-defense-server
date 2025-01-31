import config from '../../config/configs.js';
import Base from './base.class.js';
import Monster from './monster.class.js';
import Tower from './tower.class.js';
import { makeStateSyncNotification } from '../../utils/send-packet/payload/notification/game.notification.js';
import { makeMonsterData, makeTowerData } from '../../utils/send-packet/payload/game.data.js';
import { roomSession } from '../../session/session.js';

/* 게임 관련 환경변수 꺼내기 */
const { game } = config;

/* Player 클래스 */
class Player {
  constructor(user, opponentId) {
    this.user = user;
    this.opponentId = opponentId;
    this.score = game.initialScore;
    this.gold = game.initialGold;
    this.base = new Base(game.baseHp);
    this.towers = new Map(); // 보유 타워 목록
    this.monsters = new Map(); // 스폰된 몬스터 목록
  }

  /* 타워 설치 처리하는 메서드 */
  placeTower(room, x, y) {
    // [1] 보유 골드가 모자른 경우 거부
    if (this.gold < game.towerCost) return null;
    else {
      // [2] 설치할 타워에 식별자 부여
      const towerId = room.getTowerId();
      // [3] 설치 가격만큼 골드 차감
      this.gold -= game.towerCost;
      // [4] 보유 타워 목록에 설치할 타워 추가 (클라 기준 타워 유형은 Rcode : TOW00001 고정)
      this.towers.set(towerId, new Tower(towerId, x, y, 'TOW00001', this.user.id));
      return towerId;
    }
  }

  /* 특정 타워 인스턴스 조회하는 메서드 */
  getTower(towerId) {
    return this.towers.get(towerId);
  }

  /* 특정 몬스터 인스턴스 조회하는 메서드 */
  getMonster(monsterId) {
    return this.monsters.get(monsterId);
  }

  /* 몬스터 스폰 처리하는 메서드 */
  spawnMonster(monsterId, monsterNumber, level) {
    this.monsters.set(monsterId, new Monster(monsterId, monsterNumber, this.user.id, level));
  }

  /* 몬스터 처치 처리하는 메서드 */
  killMonster(monsterId) {
    this.monsters.delete(monsterId);
    this.gold += game.monsterGold;
    this.score += game.monsterScore;
  }

  /* 레벨에 맞는 타워 데미지 일괄 적용하는 메서드 */
  intensifyTowers(level) {
    for (const tower of this.towers.values()) {
      tower.levelUp(level);
    }
  }

  /* 상태 동기화 페이로드 만드는 메서드 */
  makeSyncPayload() {
    // [1] 소속 룸에서 현 몬스터레벨 가져옴
    const monsterLevel = roomSession.getRoom(this.user.roomId).monsterLevel;
    // [2] 본인 타워 데이터 프로토 정의에 맞게 변환
    const towerData = [...this.towers.values()].map((tower) => {
      return makeTowerData(tower.towerId, tower.x, tower.y);
    });
    // [3] 본인 몬스터 데이터 프로토 정의에 맞게 변환
    const monsterData = [...this.monsters.values()].map((monster) => {
      return makeMonsterData(monster.monsterId, monster.monsterNumber, monsterLevel);
    });
    // [4] 상태동기화 페이로드 역시 프로토 정의에 맞게 변환해 반환
    return makeStateSyncNotification(
      this.gold,
      this.base.hp,
      monsterLevel,
      this.score,
      towerData,
      monsterData,
    );
  }
}

export default Player;
