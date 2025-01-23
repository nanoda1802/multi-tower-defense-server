import config from '../../config/configs.js';

const { userState } = config;

class User {
  // 여기도 roomId 있어야하려나....?
  constructor(id, socket, winCount, loseCount, mmr, highScore, initSequence) {
    this.id = id;
    this.roomId = null;
    this.socket = socket;
    this.state = userState.waiting; // "waiting", "matchMaking", "playing"
    this.sequence = initSequence; // 클라에서 헤더로 주자나?

    this.highScore = highScore;
    this.matchRecord = {
      win: winCount,
      lose: loseCount,
    };
    this.mmr = mmr;
  }

  enterRoom(roomId) {
    this.roomId = roomId;
  }

  // 룸에서 하나...? 무튼
  matchMake() {
    this.state = userState.matchMaking;
  }

  startGame() {
    this.state = userState.gamePlaying;
  }

  // 플레이어에서 해야하나? 무튼
  finishGame() {
    this.state = userState.waiting;
    // matchRecord 최신화
    // mmr 계산해 최신화
  }

  calculateMmr() {}

  getSequence() {
    return ++this.sequence;
  }
}

export default User;
