import config from "../../config/configs.js";
import makePacketBuffer from "../../utils/send-packet/makePacket.js";

class Base {
  constructor(maxHp) {
    this.gameOver = false;
    this.maxHp = maxHp;
    this.hp = maxHp;
  }

  damaged(room, userId, damage) {
    if (this.hp - damage > 0) this.hp -= monster.atk;
    else {
      // 게임종료 알림 패킷 생성
      // room 내의 플레이어들에게 전달
      room.players.forEach((player) => {
        let packet
        // player가 자신일 경우 패배, 다를 경우 승리 정보를 반환
        if(player.playerId === userId)
          packet = makePacketBuffer(config.packetType.gameOverNotification, { isWin: false })
        else
          packet = makePacketBuffer(config.packetType.gameOverNotification, { isWin: true })
        player.socket.write(packet)
      });
    }
  }

  getHp() {
    return this.hp;
  }
}

export default Base;
