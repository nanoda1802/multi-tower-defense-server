import towerData from '../../assets/tower.js';

class Tower {
  constructor(towerId, x, y, Rcode, playerId) {
    this.towerId = towerId;
    this.x = x;
    this.y = y;
    this.stat = towerData.find((e) => e.Rcode === Rcode);
    this.damage = 0;
    this.lastUpdate = 0;
    this.playerId = playerId;
  }

  attackMonster(monster) {
    // const timeDiff = Date.now() - this.lastUpdate;
    // 공격 쿨타임 확인
    // if (timeDiff < this.stat.coolDown) return false
    // 위치 정보 확인
    // const distance = Math.floor(Math.sqrt((this.x - monster.x) ** 2 + (this.y - monster.y)** 2))
    // if (distance > this.stat.range) return false

    // 몬스터 공격 적용
    monster.damaged(this.getDamage())
    // this.lastUpdate = Date.now();
    return true
  }

  setLevel(level) {
    this.damage = this.stat.power + level * this.stat.powerPerLv;
  }

  getDamage() {
    return this.damage
  }
}

export default Tower;
