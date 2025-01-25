import net from 'net';
import { getProtoMessages, loadProtos } from './init/load.proto.js';
import config from './config/configs.js';

const HOST = '127.0.0.1';
const PORT = 5555;

class Client {
  constructor(id, password) {
    this.id = id;
    this.password = password;
    this.socket = new net.Socket();
    this.sequence = 1;
    this.buffer = Buffer.alloc(0);

    this.socket.connect(PORT, HOST, this.onConnection.bind(this));
    this.socket.on('data', this.onData.bind(this));
    this.socket.on('close', this.onClose.bind(this));
    this.socket.on('error', this.onError.bind(this));
  }

  async onConnection() {
    console.log('Connectied to server');
    this.buffer = Buffer.alloc(0);
  }

  async onData(data) {
    try {
      this.buffer = Buffer.concat([this.buffer, data]);

      const packetTypeByte = config.header.typeByte;
      const versionLengthByte = config.header.versionLengthByte;
      let versionByte = null;
      const sequenceByte = config.header.sequenceByte;
      const payloadLengthByte = config.header.payloadLengthByte;

      while (this.buffer.length >= packetTypeByte + versionLengthByte) {
        versionByte = this.buffer.readUInt8(packetTypeByte);
        while (
          this.buffer.length >=
          packetTypeByte + versionLengthByte + versionByte + sequenceByte + payloadLengthByte
        ) {
          // 버전 검증
          let versionOffset = packetTypeByte + versionLengthByte;
          const version = this.buffer.slice(versionOffset, versionOffset + versionByte).toString();
          if (!version === config.env.clientVersion) return;

          // 시퀀스 검증
          const expectedSequence = this.sequence;
          const receivedSequence = this.buffer.readUInt32BE(
            packetTypeByte + versionLengthByte + versionByte,
          );
          if (expectedSequence !== receivedSequence) {
            console.log(
              `시퀀스 오류. 기대 시퀀스:${expectedSequence}, 수신한 시퀀스:${receivedSequence}`,
            );
            return;
          }

          const headerLength =
            packetTypeByte + versionLengthByte + versionByte + sequenceByte + payloadLengthByte;
          const payloadLength = this.buffer.readUInt32BE(
            packetTypeByte + versionLengthByte + versionByte + sequenceByte,
          );

          if (this.buffer.length >= headerLength + payloadLength) {
            const packetType = this.buffer.readUInt16BE(0);
            const payloadBuffer = this.buffer.slice(headerLength, headerLength + payloadLength);
            this.buffer = this.buffer.slice(headerLength + payloadLength);

            const proto = getProtoMessages().GamePacket;
            const gamePacket = proto.decode(payloadBuffer);
            const payload = gamePacket[gamePacket.payload];

            //printHeader(packetType, versionByte, version, receivedSequence, payloadLength, 'in');

            // S2C 패킷타입별 핸들러 실행
            switch (packetType) {
              case config.packetType.registerResponse:
                console.log(this.id, payload.message);
                break;
              case config.packetType.loginResponse:
                console.log(this.id, payload.message);
                break;
              case config.packetType.matchStartNotification:
                console.log(this.id, '매칭 성공');
                break;
              case config.packetType.matchStartNotification:
                //console.log('서버로부터 응답', JSON.stringify(payload, null, 2));
                break;
              default:
                console.log('핸들러가 등록되지 않은 패킷 타입 : ', packetType);
                break;
            }
          }
        }
      }
    } catch (error) {
      console.log('패킷 수신 오류');
      console.error(error);
    }
  }

  registerRequestTest() {
    const registerRequestPayload = {
      id: this.id,
      password: this.password,
      email: 'test@gmail.com',
    };
    this.sendPacket(config.packetType.registerRequest, registerRequestPayload);
  }

  loginRequestTest() {
    const loginRequestPayload = { id: this.id, password: this.password };
    this.sendPacket(config.packetType.loginRequest, loginRequestPayload);
  }

  matchRequestTest() {
    const matchRequestPayload = {};
    this.sendPacket(config.packetType.matchRequest, matchRequestPayload);
  }

  // 버퍼로 변환 및 송신
  sendPacket(type, payload, sequence = this.getSequence()) {
    //패킷타입 (number -> string)
    const packetTypeValues = Object.values(config.packetType);
    const packetTypeIndex = packetTypeValues.findIndex((f) => f === type);
    const packeTypeName = Object.keys(config.packetType)[packetTypeIndex];
    if (packetTypeIndex === -1) throw new Error('정의되지 않은 타입');

    // 페이로드
    const proto = getProtoMessages().GamePacket;
    const message = proto.create({ [packeTypeName]: payload });
    const payloadBuffer = proto.encode(message).finish();

    // 헤더 필드값
    const version = config.env.clientVersion || '1.0.0';
    const versionLength = version.length;
    const payloadLength = payloadBuffer.length;

    //printHeader(type, versionLength, version, sequence, payloadLength, 'out');

    // 헤더 필드 - 패킷 타입
    const packetTypeBuffer = Buffer.alloc(2);
    packetTypeBuffer.writeUint16BE(type, 0);

    // 헤더 필드 - 버전 길이
    const versionLengthBuffer = Buffer.alloc(1);
    versionLengthBuffer.writeUInt8(versionLength, 0);

    // 헤더 필드 - 버전
    const versionBuffer = Buffer.from(version);

    // 헤더 필드 - 시퀀스
    const sequenceBuffer = Buffer.alloc(4);
    sequenceBuffer.writeUint32BE(sequence, 0);

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

    this.socket.write(packetBuffer);
  }

  getSequence() {
    return this.sequence++;
  }

  onClose() {
    console.log('Connection closed');
  }

  onError() {
    console.error('Client error:', err);
  }
}

/////////////////////////////// 테스트 로직 //////////////////////////////////////////////
await loadProtos().then(matchTest);

async function matchTest() {
  for (let i = 1; i <= 10; i+=2) {
    const id1 = 'test' + i;
    const id2 = 'test' + (i+1);
    const password = '1234';
    const client1 = new Client(id1, password);
    const client2 = new Client(id2, password);
    client1.loginRequestTest();
    client2.loginRequestTest();
    await delay(100);
    client1.matchRequestTest();
    client2.matchRequestTest();
    await delay(100);
  }
}

async function loginTest() {
  for (let i = 1; i <= 100; i++) {
    const id = 'test' + i;
    const password = '1234';
    const client = new Client(id, password);
    await delay(100);
  }
}

async function registerTest() {
  for (let i = 1; i <= 10000; i++) {
    const id = 'test' + i;
    const password = '1234';
    const client = new Client(id, password);
    await delay(5);
  }
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function printHeader(packetType, versionLength, version, sequence, payloadLength, inOut = '') {
  if (inOut === 'in') console.log('------------- 받는 값 -------------');
  else if (inOut === 'out') console.log('------------- 주는 값 -------------');
  else console.log('------------- 헤더 -------------');
  console.log('type:', packetType);
  console.log('versionLength:', versionLength);
  console.log('version:', version);
  console.log('sequence:', sequence);
  console.log('payloadLength:', payloadLength);
  console.log('-------------------------------');
}
