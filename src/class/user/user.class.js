import { getProtoMessages } from '../../init/load.proto.js';
import config from '../../config/configs.js';

const { userState } = config;

class User {
  constructor(socket) {
    this.key = null;
    this.id = null;
    this.roomId = null;
    this.socket = socket;
    this.state = userState.waiting; // "waiting", "matchMaking", "playing"

    this.matchRecord = {
      win: null,
      lose: null,
    };
    this.mmr = null;
    this.highScore = null;
    this.sequence = 1;
  }

  login(key, userId, winCount, loseCount, mmr, highScore) {
    this.key = key;
    this.id = userId;
    this.matchRecord.win = winCount;
    this.matchRecord.lose = loseCount;
    this.mmr = mmr;
    this.highScore = highScore;
  }

  enterRoom(roomId) {
    this.roomId = roomId;
  }

  matchMaking() {
    this.state = userState.matchMaking;
  }

  playing() {
    this.state = userState.playing;
  }

  /* 경기 결과 최신화시키기 */
  updateMatchRecord(isWin, scoreResult) {
    // [1] 이겼으면 승수 + 1, 졌으면 패수 + 1
    if (isWin) {
      this.matchRecord.win += 1;
    } else {
      this.matchRecord.lose += 1;
    }
    // [2] 획득 점수가 최고 기록 보다 높다면 최신화
    if (scoreResult > this.highScore) this.highScore = scoreResult;
  }

  getSequence() {
    return this.sequence++;
  }

  sendPacket(packetType, payload) {
    //패킷타입 (number -> string)
    const packetTypeValues = Object.values(config.packetType);
    const packetTypeIndex = packetTypeValues.findIndex((f) => f === packetType);
    const packetTypeName = Object.keys(config.packetType)[packetTypeIndex];

    // 페이로드
    const proto = getProtoMessages().GamePacket;
    const message = proto.create({ [packetTypeName]: payload });
    const payloadBuffer = proto.encode(message).finish();

    // 헤더 필드값
    const version = config.env.clientVersion || '1.0.0';
    const versionLength = version.length;
    const payloadLength = payloadBuffer.length;

    // 헤더 쓰기 - 패킷 타입
    const packetTypeBuffer = Buffer.alloc(2);
    packetTypeBuffer.writeUint16BE(packetType, 0);

    // 헤더 쓰기 - 버전 길이
    const versionLengthBuffer = Buffer.alloc(1);
    versionLengthBuffer.writeUInt8(versionLength, 0);

    // 헤더 쓰기 - 버전
    const versionBuffer = Buffer.from(version);

    // 헤더 쓰기 - 시퀀스
    const sequenceBuffer = Buffer.alloc(4);
    sequenceBuffer.writeUint32BE(this.sequence, 0);

    // 헤더 쓰기 - 페이로드 길이
    const payloadLengthBuffer = Buffer.alloc(4);
    payloadLengthBuffer.writeUInt32BE(payloadLength, 0);

    // 헤더 만들기
    const headerBuffer = Buffer.concat([
      packetTypeBuffer,
      versionLengthBuffer,
      versionBuffer,
      sequenceBuffer,
      payloadLengthBuffer,
    ]);

    // 디버깅
    if (packetType === 7) {
      printHeader(packetType, versionLength, version, sequence, payloadLength, 'out');
      console.log('payload', message);
    }

    // 패킷 만들기
    const packetBuffer = Buffer.concat([headerBuffer, payloadBuffer]);

    this.socket.write(packetBuffer);
  }
}

export default User;
