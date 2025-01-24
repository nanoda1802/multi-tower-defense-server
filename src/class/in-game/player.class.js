import config from '../../config/configs.js';
import Base from './base.class.js';
import Monster from './monster.class.js';
import Tower from './tower.class.js';

/* 게임 관련 환경변수 꺼내기 */
const { game } = config;

class Player {
  /* 베이스, 몬스터, 타워에 필요한 매개변수 말씀해주시면 추가하기 */
  constructor(userId, socket, roomId) {
    this.id = userId;
    this.socket = socket; // 아니면 User 인스턴스를 통째로....? sequence 때문에 고민
    this.roomId = roomId;
    this.opponentId = null; // 일단 기존 기획대로
    // 이부분 생성자에서 나중에 추가 예정
    this.highScore = 0;
    this.score = 0;
    this.gold = game.initialGold;
    this.base = new Base(game.baseHp);
    this.towers = new Map(); // 여기는 뭐로 식별할지 고민해봐야함
    this.monsters = new Map(); // 아마 key에 클라에서 보내주는 monsterNumber를?
  }

  /* 베이스, 몬스터, 타워에 필요한 매개변수 말씀해주시면 추가하기 */
  placeTower(room, x,y) {
    // 골드가 충분한지 확인
    if (this.gold < game.towerCost) return -1
    else {
      const towerId = room.getTowerId();
      this.gold -= game.towerCost;
      // 현재 클라이언트에서 생성되는 타워는 TOW00001이 유일하기에 고정
      this.towers.set(towerId, new Tower(towerId, x, y,"TOW00001",this.id));
      return towerId
    }
  }
  
  getTower(towerId) {
    return this.towers.get(towerId);
  }

  spawnMonster(monsterId, monsterNumber) {
    this.monsters.set(monsterId, new Monster(monsterId, monsterNumber, this.id));
  }

  killMonster(monsterId) {
    this.monsters.delete(monsterId);
    this.gold += game.monsterGold
    this.score += game.monsterScore
  }

  getMonster(monsterId) {
    return this.monsters.get(monsterId);
  }



}

export default Player;
