import towerData from '../../assets/tower.js';

/* Tower 클래스 */
class Tower {
  constructor(towerId, x, y, Rcode, playerId) {
    this.towerId = towerId;
    this.x = x;
    this.y = y;
    this.stat = towerData.find((e) => e.Rcode === Rcode);
    this.damage = this.stat.power;
    this.playerId = playerId;
  }

  /* 몬스터 공격 처리하는 메서드 */
  attackMonster(monster) {
    monster.damaged(this.damage);
  }

  /* 레벨에 맞게 데미지 조정하는 메서드 */
  levelUp(level) {
    this.damage = this.stat.power + level * this.stat.powerPerLv;
  }
}

export default Tower;
