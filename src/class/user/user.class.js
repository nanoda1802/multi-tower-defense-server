import { getProtoMessages } from '../../init/load.proto.js';
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
    // 임시 값 저장 (테스트용 후엔 null로 변경해야함)
    this.mmr = 100;
    this.sequence = 1;
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

  sendPacket(packetType, payload) {
    //패킷타입 (number -> string)
    const packetTypeValues = Object.values(config.packetType);
    const packetTypeIndex = packetTypeValues.findIndex((f) => f === packetType);
    const packeTypeName = Object.keys(config.packetType)[packetTypeIndex];

    // 페이로드
    const proto = getProtoMessages().GamePacket;
    const message = proto.create({ [packeTypeName]: payload });
    const payloadBuffer = proto.encode(message).finish();

    // 헤더 필드값
    const version = config.env.clientVersion || '1.0.0';
    const versionLength = version.length;
    const payloadLength = payloadBuffer.length;

    if (true) {
      // 콘솔로그 필터링하려면 조건 입력
      console.log('------------- 주는 값 -------------');
      console.log(`type: ${packetType}.${packeTypeName}`);
      console.log('versionLength:', versionLength);
      console.log('version:', version);
      console.log('sequence:', this.sequence);
      console.log('payloadLength:', payloadLength);
      console.log('payload:', message);
      console.log('-------------------------------');
    }

    // 헤더 필드 - 패킷 타입
    const packetTypeBuffer = Buffer.alloc(2);
    packetTypeBuffer.writeUint16BE(packetType, 0);

    // 헤더 필드 - 버전 길이
    const versionLengthBuffer = Buffer.alloc(1);
    versionLengthBuffer.writeUInt8(versionLength, 0);

    // 헤더 필드 - 버전
    const versionBuffer = Buffer.from(version);

    // 헤더 필드 - 시퀀스
    const sequenceBuffer = Buffer.alloc(4);
    sequenceBuffer.writeUint32BE(this.sequence, 0);

    // 헤더 필드 - 페이로드 길이
    const payloadLengthBuffer = Buffer.alloc(4);
    payloadLengthBuffer.writeUInt32BE(payloadLength, 0);

    // 헤더
    const headerBuffer = Buffer.concat([
      packetTypeBuffer,
      versionLengthBuffer,
      versionBuffer,
      sequenceBuffer,
      payloadLengthBuffer,
    ]);

    // 패킷
    const packetBuffer = Buffer.concat([headerBuffer, payloadBuffer]);

    this.socket.write(packet);
  }
}

export default User;
