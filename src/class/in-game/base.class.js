class Base {
  constructor(maxHp) {
    this.gameOver = false;
    this.maxHp = maxHp;
    this.hp = maxHp;
  }

  damaged(damage) {
    if (this.hp - damage > 0) this.hp -= monster.atk;
    else {
      this.hp = 0
      this.gameOver = true
    }
  }

  getHp() {
    return this.hp;
  }
}

export default Base;
