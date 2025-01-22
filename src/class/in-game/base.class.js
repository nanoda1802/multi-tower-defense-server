class Base {
  constructor(maxHp) {
    this.gameOver = false;
    this.maxHp = maxHp;
    this.hp = maxHp;
  }

  damaged(room, damage) {
    if (this.hp - damage > 0) this.hp -= monster.atk;
    else {
      // 게임종료 알림 패킷 생성

      // room 내의 플레이어들에게 전달
      room.players.forEach((player) => player.socket.write())
    }
  }

  getHp() {
    return this.hp;
  }
}

export default Base;
