import towerData from '../../assets/tower.js';

/* Tower 클래스 */
class Tower {
  constructor(towerId, x, y, Rcode, playerId) {
    this.towerId = towerId;
    this.x = x;
    this.y = y;
    this.stat = towerData.find((e) => e.Rcode === Rcode);
    this.damage = 0;
    this.playerId = playerId;
    // this.lastUpdate = 0;
  }

  /* 몬스터 공격 처리하는 메서드 */
  attackMonster(monster) {
    monster.damaged(this.damage);
  }

  /* 레벨에 맞게 데미지 조정하는 메서드 */
  levelUp(level) {
    this.damage = this.stat.power + level * this.stat.powerPerLv;
  }

  /* 밑은 기존 코드 */
  // attackMonster(monster) {
  //   // const timeDiff = Date.now() - this.lastUpdate;
  //   // 공격 쿨타임 확인
  //   // if (timeDiff < this.stat.coolDown) return false
  //   // 위치 정보 확인
  //   // const distance = Math.floor(Math.sqrt((this.x - monster.x) ** 2 + (this.y - monster.y)** 2))
  //   // if (distance > this.stat.range) return false

  //   // 몬스터 공격 적용
  //   monster.damaged(this.damage);
  //   // this.lastUpdate = Date.now();
  //   return true;
  // }

  // getDamage() {
  //   return this.damage
  // }
}

export default Tower;
