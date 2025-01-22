import monsterData from '../../assets/monster.js'

class Monster {
    constructor(monsterId, monsterNumber, level, Rcode) {
      this.monsterId = monsterId;
      this.monsterNumber = monsterNumber;
      this.level = level;
      this.stat = monsterData.find((element) => element.Rcode === Rcode);
      this.type = ''; //'own', 'enemy' 로 표기
      this.spawnAt = Date.now();
      this.gold = 0; // 데이터에서 받아올지? 값을 지정해줄지?

    }
  

  }
  

export default Monster;
