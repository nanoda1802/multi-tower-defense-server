import monsterData from '../../assets/monster.js';

class Monster {
  constructor(monsterId, monsterNumber, playerId, level) {
    this.level = level
    this.monsterId = monsterId;
    this.monsterNumber = monsterNumber;
    this.stat = monsterData.find((element) => element.Rcode === 'MON0000' + monsterNumber);
    this.playerId = playerId;
    this.hp = this.stat.maxHp + this.level * this.stat.hpPerLv
  }

  monsterDef() {
    return this.stat.defPerLv * this.level;
  }

  damaged(damage) {
    this.hp -= Math.min(this.monsterDef() - damage,0)
  }
}

export default Monster;
