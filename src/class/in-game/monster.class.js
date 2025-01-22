import monsterData from '../../assets/monster.js'

class Monster {
    constructor(monsterId, monsterNumber, level, Rcode) {
      this.monsterId = monsterId;
      this.monsterNumber = monsterNumber;
      this.level = level;
      this.stat = monsterData.find((element) => element.Rcode === Rcode);
      this.type = ''; //'own', 'enemy' 로 표기
    }
  
  }
  

export default Monster;
