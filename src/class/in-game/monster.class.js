import monsterData from '../../assets/monster.js';

/* Monster 클래스 */
class Monster {
  constructor(monsterId, monsterNumber, playerId, level) {
    this.level = level;
    this.monsterId = monsterId;
    this.monsterNumber = monsterNumber;
    this.stat = monsterData.find((element) => element.Rcode === 'MON0000' + monsterNumber);
    this.playerId = playerId; // 누구에게 스폰된 녀석인지 식별
    this.hp = this.stat.maxHp + this.level * this.stat.hpPerLv;
  }

  /* 레벨에 따른 방어력 적용해 반환하는 메서드 */
  getDef() {
    return this.stat.defPerLv * this.level;
  }

  /* 몬스터가 받은 데미지 처리하는 메서드 */
  damaged(damage) {
    // 방어력을 뚫지 못하는 데미지면 0으로 처리
    this.hp -= Math.min(this.getDef() - damage, 0);
  }
}

export default Monster;
