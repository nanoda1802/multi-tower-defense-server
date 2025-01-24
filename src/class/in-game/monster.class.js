import monsterData from '../../assets/monster.js';

class Monster {
  constructor(monsterId, monsterNumber, playerId) {
    this.monsterId = monsterId;
    this.monsterNumber = monsterNumber;
    this.stat = monsterData.find((element) => element.Rcode === 'MON0000' + monsterNumber);
    this.playerId = playerId;
    this.hp = 100
  }

  monsterDef() {
    return this.stat.defPerLv * this.level;
  }

  monsterAtk() {
    return this.stat.atkPerLv * this.level + this.stat.atk;
  }

  damaged(damage) {
    this.hp -= damage
  }
}

export default Monster;
