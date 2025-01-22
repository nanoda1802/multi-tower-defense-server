import towerData from '../../assets/tower.js';

class Tower {
  constructor(towerId, x, y, Rcode) {
    this.towerId = towerId;
    this.level = 0;
    this.x = x;
    this.y = y;
    this.stat = towerData.find((e) => e.Rcode === Rcode);
    this.lastUpdate = 0;
  }

  isAttackPossible(targetX, targetY) {
    const timeDiff = Date.now() - this.lastUpdate;

    // 위치 정보 확인
    if (
      this.x + this.stat.range / 2 > targetX ||
      this.x - this.stat.range / 2 < targetX ||
      this.y + this.stat.range / 2 > targetY ||
      this.y - this.stat.range / 2 < targetY
    )
      return false;

    // 공격 쿨타임 확인
    if (timeDiff < this.stat.coolDown) return false;

    this.lastUpdate = Date.now();
    return true;
  }

  levelUp() {
    this.level++;
  }

  getDamage() {
    return this.stat.power + this.level * this.stat.powerPerLv;
  }
}

export default Tower;
