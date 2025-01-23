import config from '../../config/configs.js';

const { userState } = config;

class User {
  // 여기도 roomId 있어야하려나....?
  constructor(socket) {
    this.key = null;
    this.id = null;
    this.roomId = null;
    this.socket = socket;
    this.state = userState.waiting; // "waiting", "matchMaking", "playing"

    this.highScore = null;
    this.matchRecord = {
      win: null,
      lose: null,
    };
    this.mmr = null;
    this.sequence = 1; // 클라에서 헤더로 주자나?
  }

  login(key, userId, highScore, winCount, loseCount, mmr) {
    this.key = key;
    this.id = userId;
    this.highScore = highScore;
    this.matchRecord.win = winCount;
    this.matchRecord.lose = loseCount;
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
    return this.sequence++;
  }
}

export default User;
