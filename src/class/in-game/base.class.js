/* Base 클래스 */
class Base {
  constructor(maxHp) {
    this.maxHp = maxHp; // 최대 체력
    this.hp = maxHp; // 현재 체력
  }

  /* 베이스가 받은 데미지 처리하는 메서드 */
  damaged(damage) {
    if (this.hp - damage > 0) this.hp -= damage;
    else this.hp = 0; // 체력이 0 아래론 떨어지지 않도록 함
    return this.hp;
  }

  // /* 현재 체력 조회하는 메서드 */
  // getCurrentHp() {
  //   return this.hp;
  // }
}

export default Base;
