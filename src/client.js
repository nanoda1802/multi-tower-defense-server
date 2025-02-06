import net from 'net';
import { getProtoMessages, loadProtos } from './init/load.proto.js';
import config from './config/configs.js';

const HOST = config.env.host;
const PORT = config.env.port;

let idNumber = 1;
function getIdNumber() {
  return idNumber++;
}

class Client {
  constructor(id, password) {
    this.id = id;
    this.idx = getIdNumber();
    this.password = password;
    this.socket = new net.Socket();
    this.sequence = 1;
    this.buffer = Buffer.alloc(0);
    this.isConnected = true;

    this.socket.connect(PORT, HOST, this.onConnection.bind(this));
    this.socket.on('data', this.onData.bind(this));
    this.socket.on('close', this.onClose.bind(this));
    this.socket.on('error', this.onError.bind(this));
  }

  async onConnection() {
    console.log('Connectied to server');
    this.socket.buffer = Buffer.alloc(0);
  }

  async onData(data) {
    try {
      this.socket.buffer = Buffer.concat([this.socket.buffer, data]);

      const packetTypeByte = config.header.typeByte;
      const versionLengthByte = config.header.versionLengthByte;
      let versionByte = null;
      const sequenceByte = config.header.sequenceByte;
      const payloadLengthByte = config.header.payloadLengthByte;

      while (this.socket.buffer.length >= packetTypeByte + versionLengthByte) {
        versionByte = this.socket.buffer.readUInt8(packetTypeByte);
        while (
          this.socket.buffer.length >=
          packetTypeByte + versionLengthByte + versionByte + sequenceByte + payloadLengthByte
        ) {
          // 버전 검증
          let versionOffset = packetTypeByte + versionLengthByte;
          const version = this.socket.buffer.subarray(versionOffset, versionOffset + versionByte).toString();
          if (!version === config.env.clientVersion) return;

          // 시퀀스 검증
          const expectedSequence = this.sequence;
          const receivedSequence = this.socket.buffer.readUInt32BE(
            packetTypeByte + versionLengthByte + versionByte,
          );
          if (expectedSequence !== receivedSequence) {
            // console.log(
            //   `시퀀스 오류. 기대 시퀀스:${expectedSequence}, 수신한 시퀀스:${receivedSequence}`,
            // );
            // return;
          }

          const headerLength =
            packetTypeByte + versionLengthByte + versionByte + sequenceByte + payloadLengthByte;
          const payloadLength = this.socket.buffer.readUInt32BE(
            packetTypeByte + versionLengthByte + versionByte + sequenceByte,
          );

          if (this.socket.buffer.length >= headerLength + payloadLength) {
            const packetType = this.socket.buffer.readUInt16BE(0);
            const payloadBuffer = this.socket.buffer.subarray(headerLength, headerLength + payloadLength);
            this.socket.buffer = this.socket.buffer.subarray(headerLength + payloadLength);

            const proto = getProtoMessages().GamePacket;
            const gamePacket = proto.decode(payloadBuffer);
            const payload = gamePacket[gamePacket.payload];

            //printHeader(packetType, versionByte, version, receivedSequence, payloadLength, 'in');

            // S2C 패킷타입별 핸들러 실행
            switch (packetType) {
              case config.packetType.registerResponse:
                if (!payload.success) throw new Error(payload.message);
                console.log(this.id, this.idx, payload.message);
                break;
              case config.packetType.loginResponse:
                if (!payload.success) {
                  if (payload.message !== '이미 접속된 계정임다!') throw new Error(payload.message);
                }
                console.log(this.id, this.socket.localPort, payload.message);
                break;
              case config.packetType.matchStartNotification:
                console.log(this.id, '매칭 성공');
                break;
              case config.packetType.stateSyncNotification:
                console.log(this.id, '상태동기화');
                break;
              case config.packetType.towerPurchaseResponse:
                if (!payload.towerId) throw new Error('타워구매 응답 에러');
                break;
              case config.packetType.addEnemyTowerNotification:
                if (!payload.towerId) throw new Error('타워구매 노티파이 에러');
                break;
              case config.packetType.spawnMonsterResponse:
                //console.log(this.id, '몬스터 소환', payload);
                if (!payload.monsterId || !payload.monsterNumber)
                  throw new Error('몬스터소환 응답 에러');
                break;
              case config.packetType.spawnEnemyMonsterNotification:
                //console.log(this.id, '적몬스터 소환', payload);
                if (!payload.monsterId || !payload.monsterNumber)
                  throw new Error('몬스터소환 노티파이 에러');
                break;
              case config.packetType.enemyTowerAttackNotification:
                if (!payload.towerId || !payload.monsterId)
                  throw new Error('적 타워 공격 패킷 에러');
                break;
              case config.packetType.updateBaseHpNotification:
                if (!payload.isOpponent || !payload.baseHp)
                  throw new Error('타워 HP 업데이트 에러');
              case config.packetType.gameOverNotification:
                if (!payload) throw new Error('게임오버 에러');
                console.log(this.id, payload.isWin ? '승리' : '패배');
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

  async registerRequestTest() {
    const registerRequestPayload = {
      id: this.id,
      password: this.password,
      email: 'test@gmail.com',
    };
    this.sendPacket(config.packetType.registerRequest, registerRequestPayload);
  }

  async loginRequestTest() {
    const loginRequestPayload = { id: this.id, password: this.password };
    this.sendPacket(config.packetType.loginRequest, loginRequestPayload);
  }

  async matchRequestTest() {
    const matchRequestPayload = {};
    this.sendPacket(config.packetType.matchRequest, matchRequestPayload);
  }

  async spawnMonsterRequestTest() {
    const spawnMonsterRequestPayload = {};
    this.sendPacket(config.packetType.spawnMonsterRequest, spawnMonsterRequestPayload);
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

  async onClose() {
    this.isConnected = false;
    console.log('Connection closed');
  }

  async onError(err) {
    this.isConnected = false;
    console.error('Client error:');
  }
}

/////////////////////////////// 테스트 로직 //////////////////////////////////////////////
await loadProtos().then(gameTest);

// 게임 테스트
async function gameTest() {
  const client_count = 200;
  const spawn_count = 100;

  await Promise.all(
    Array.from({ length: client_count }, async () => {
      const id = 'test1'
      const password = '1234';
      const client = new Client(id, password);
      await client.loginRequestTest();
    }));
  // );
  // let end = Date.now();
  // const loginTestTime = (end - start) / 1000;
  // await delay(3000);
  // start = Date.now();
  // await Promise.all(clients.map((client) => client.matchRequestTest()));
  // end = Date.now();
  // const matchTestTime = (end - start) / 1000;
  // await delay(3000);

  // start = Date.now();
  // for (let i = 0; i < spawn_count; i++) {
  //   await Promise.all(
  //     clients.map((client) => {
  //       if (client.isConnected) return client.spawnMonsterRequestTest();
  //     }),
  //   );
  //   await delay(1000);
  // }
  // end = Date.now();
  // const gameTestTime = (end - start) / 1000;

  // console.log(`테스트 클라이언트 수 : ${client_count}`);
  // console.log(`테스트 소환 횟수 : ${spawn_count}`);
  // console.log(`로그인 테스트 소요 시간 : ${loginTestTime}`);
  // console.log(`매칭 테스트 소요 시간 : ${matchTestTime}`);
  // console.log(`테스트 소요 시간 : ${gameTestTime}`);
  // console.log('부하테스트 완료');
}

// 시퀀스 조작 테스트
async function invalidSequenceTest() {
  let client1, client2;
  const id1 = 'test1';
  const id2 = 'test1';
  const password = '1234';
  client1 = new Client(id1, password);
  client2 = new Client(id2, password);
  await delay(10);
  client1.loginRequestTest();
  client2.loginRequestTest();
  await delay(1000);
  client1.matchRequestTest();
  client2.matchRequestTest();
  await delay(1000);
  console.log('몬스터 소환 시작');
  for (let i = 0; i < 10; i++) {
    if (i === 5) client2.getSequence();
    client1.spawnMonsterRequestTest();
    client2.spawnMonsterRequestTest();
    await delay(500);
    if (!client1.isConnected) {
      console.log('클라이언트1 종료');
      break;
    }
    if (!client2.isConnected) {
      console.log('클라이언트2 종료');
      break;
    }
  }
}

async function matchTest() {
  let client1, client2;
  for (let i = 1; i <= 10; i += 2) {
    const id1 = 'test' + i;
    const id2 = 'test' + (i + 1);
    const password = '1234';
    client1 = new Client(id1, password);
    client2 = new Client(id2, password);
    await delay(10);
    client1.loginRequestTest();
    client2.loginRequestTest();
    await delay(1000);
    client1.matchRequestTest();
    client2.matchRequestTest();
  }
}

async function loginTest() {
  const count = 10000;
  for (let i = 1; i <= count; i++) {
    const id = 'test' + i;
    const password = '1234';
    const client = new Client(id, password);
    await delay(5);
    client.loginRequestTest();
  }
}

async function registerTest() {
  for (let i = 1; i <= 10000; i++) {
    const id = 'test' + i;
    const password = '1234';
    const client = new Client(id, password);
    await delay(10);
    client.registerRequestTest();
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
