import config from '../../config/configs.js';
import Base from './base.class.js';
import Monster from './monster.class.js';
import Tower from './tower.class.js';

/* 게임 관련 환경변수 꺼내기 */
const { game } = config;

class Player {
  /* 베이스, 몬스터, 타워에 필요한 매개변수 말씀해주시면 추가하기 */
  constructor(userId, socket, highScore, roomId, sequence) {
    this.id = userId;
    this.socket = socket; // 아니면 User 인스턴스를 통째로....? sequence 때문에 고민
    this.roomId = roomId;
    this.opponentId = null; // 일단 기존 기획대로
    this.highScore = highScore;
    this.score = 0;
    this.gold = game.initialGold;
    this.base = new Base();
    this.towers = new Map(); // 여기는 뭐로 식별할지 고민해봐야함
    this.monsters = new Map(); // 아마 key에 클라에서 보내주는 monsterNumber를?
    this.sequence = sequence; // 유저한테서 넘겨 받아서 쓰다가 매치 종료되면 유저에 돌려줌
  }

  getScore(point) {
    this.score += point;
  }

  matchOpponent() {} // 룸에서 해주시려나? 일단!

  /* 베이스, 몬스터, 타워에 필요한 매개변수 말씀해주시면 추가하기 */
  placeTower(towerId) {
    this.gold -= game.towerCost;
    this.towers.set(towerId, new Tower()); // 타워 식별자 필요
  }
  removeTower(towerId) {
    this.towers.delete(towerId); // 타워 식별자 필요
  }
  spawnMonster(monsterId) {
    this.monsters.set(monsterId, new Monster());
  }
  killMonster(monsterId) {
    this.monsters.delete(monsterId);
    // 골드 얻고?
  }
  increaseSequence() {
    return ++this.sequence;
  }
}

export default Player;
