import monsterData from '../../assets/monster.js'

class Monster {
    constructor(monsterId, monsterNumber, level, Rcode) {
      this.monsterId = monsterId;
      this.monsterNumber = monsterNumber;
      this.level = level;
      this.stat = monsterData.find((element) => element.Rcode === Rcode);
      this.player = '';
      this.state = 'alive'; // 'alive' 'dead' 로 표기
      this.spawnAt = Date.now();
      this.gold = 10;
    };
  
    monsterDef() {
        return this.stat.defPerLv * this.level;
    };

    monsterAtk() {
        return this.stat.atkPerLv * this.level + this.stat.atk;
    };

  };
  

export default Monster;
