import monsterData from '../../assets/monster.js';

class Monster {
  constructor(monsterId, monsterNumber, playerId) {
    this.monsterId = monsterId;
    this.monsterNumber = monsterNumber;
    this.stat = monsterData.find((element) => element.Rcode === 'MON0000' + monsterId);
    this.playerId = playerId;
    this.state = 'alive'; // 'alive' 'dead' 로 표기
    this.spawnAt = Date.now();
    this.gold = 10;
  }

  monsterDef() {
    return this.stat.defPerLv * this.level;
  }

  monsterAtk() {
    return this.stat.atkPerLv * this.level + this.stat.atk;
  }

  damaged(damage) {
    this.stat.hp -= damage
  }
}

export default Monster;
