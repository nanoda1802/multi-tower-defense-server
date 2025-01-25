import config from '../../config/configs.js';
import Base from './base.class.js';
import Monster from './monster.class.js';
import Tower from './tower.class.js';
import { makeStateSyncNotification } from '../../utils/send-packet/payload/notification/game.notification.js';
import { makeMonsterData, makeTowerData } from '../../utils/send-packet/payload/game.data.js';
import { roomSession } from '../../session/session.js';

/* 게임 관련 환경변수 꺼내기 */
const { game } = config;

class Player {
  /* 베이스, 몬스터, 타워에 필요한 매개변수 말씀해주시면 추가하기 */
  constructor(user, opponentId) {
    this.user = user;
    this.opponentId = opponentId;
    this.score = 0;
    this.gold = game.initialGold;
    this.base = new Base(game.baseHp);
    this.towers = new Map(); // 여기는 뭐로 식별할지 고민해봐야함
    this.monsters = new Map(); // 아마 key에 클라에서 보내주는 monsterNumber를?
  }

  /* 베이스, 몬스터, 타워에 필요한 매개변수 말씀해주시면 추가하기 */
  placeTower(room, x, y) {
    // 골드가 충분한지 확인
    if (this.gold < game.towerCost) return -1;
    else {
      const towerId = room.getTowerId();
      this.gold -= game.towerCost;
      // 현재 클라이언트에서 생성되는 타워는 TOW00001이 유일하기에 고정
      this.towers.set(towerId, new Tower(towerId, x, y, 'TOW00001', this.user.id));
      return towerId;
    }
  }

  getTower(towerId) {
    return this.towers.get(towerId);
  }

  spawnMonster(monsterId, monsterNumber, level) {
    this.monsters.set(monsterId, new Monster(monsterId, monsterNumber, this.user.id, level));
  }

  killMonster(monsterId) {
    this.monsters.delete(monsterId);
    this.gold += game.monsterGold;
    this.score += game.monsterScore;
  }

  getMonster(monsterId) {
    return this.monsters.get(monsterId);
  }

  /* 상태 동기화 페이로드 만들기 */
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
