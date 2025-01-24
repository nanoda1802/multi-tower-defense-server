import net from 'net';
import { getProtoMessages, loadProtos } from './init/load.proto.js';
import config from './config/configs.js';

//   | **필드 명** | **타입** | **설명** |
// | --- | --- | --- |
// | packetType | ushort | 패킷 타입 (2바이트) |
// | versionLength | ubyte | 버전 길이 (1바이트) |
// | version | string | 버전 (문자열) |
// | sequence | uint32 | 패킷 번호 (4바이트) |
// | payloadLength | uint32 | 데이터 길이 (4바이트) |
// | payload | bytes | 실제 데이터 |

const packetTypeByte = 2;
const versionLengthByte = 1;
const sequenceByte = 4;
const payloadLengthByte = 4;

const HOST = '127.0.0.1';
const PORT = 5555;

const client = new net.Socket();

let sequence = 1;

client.connect(PORT, HOST, async () => {
  console.log('Connectied to server');
  await loadProtos();

  client.buffer = Buffer.alloc(0);

  try {
    registerRequestTest('test7', '1234', 'test@gmail.com');
    await delay(2000);
    loginRequestTest('test7', '1234');
    await delay(2000);
    matchRequestTest();
    //sendPacketBuffer(config.packetType.matchRequest, sequence, matchRequestPayload);
  } catch (error) {
    console.log('C2S 패킷 전송 실패');
    console.error(error);
  }
});

function registerRequestTest(id, password, email){
  const registerRequestPayload = { id, password, email };
  sendPacketBuffer(config.packetType.registerRequest, sequence, registerRequestPayload);
}

function loginRequestTest(id, password){
  const loginRequestPayload = { id, password };
  sendPacketBuffer(config.packetType.loginRequest, sequence, loginRequestPayload);
}

function matchRequestTest(id, password){
  const matchRequestPayload = { };
  sendPacketBuffer(config.packetType.matchRequest, sequence, matchRequestPayload);
}

// 버퍼로 변환 및 송신
function sendPacketBuffer(type, sequence, payload) {
  //패킷타입 (number -> string)
  const packetTypeValues = Object.values(config.packetType);
  const packetTypeIndex = packetTypeValues.findIndex(f => f === type);
  const packeTypeName = Object.keys(config.packetType)[packetTypeIndex];
  if(packetTypeIndex===-1) throw new Error('정의되지 않은 타입');

  // 페이로드
  const proto = getProtoMessages().GamePacket;
  const message = proto.create({[packeTypeName]: payload});
  const payloadBuffer = proto.encode(message).finish();

  // 헤더 필드값
  const version = config.env.clientVersion || '1.0.0';
  const versionLength = version.length;
  const payloadLength = payloadBuffer.length;

  console.log('------------- 주는 값 -------------');
  console.log('type:', type);
  console.log('versionLength:', versionLength);
  console.log('version:', version);
  console.log('sequence', sequence);
  console.log('payloadLength', payloadLength);
  console.log('-------------------------------');

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

  addSequence();

  client.write(packetBuffer);
}

function addSequence() {
  sequence++;
}

client.on('data', (data) => {
  try {
    client.buffer = Buffer.concat([client.buffer, data]);

    const packetTypeByte = config.header.typeByte;
    const versionLengthByte = config.header.versionLengthByte;
    let versionByte = null;
    const sequenceByte = config.header.sequenceByte;
    const payloadLengthByte = config.header.payloadLengthByte;

    while (client.buffer.length >= packetTypeByte + versionLengthByte) {
      versionByte = client.buffer.readUInt8(packetTypeByte);
      while (
        client.buffer.length >=
        packetTypeByte + versionLengthByte + versionByte + sequenceByte + payloadLengthByte
      ) {
        // 버전 검증
        let versionOffset = packetTypeByte + versionLengthByte;
        const version = client.buffer.slice(versionOffset, versionOffset + versionByte).toString();
        if (!version === config.env.clientVersion) return;

        // 시퀀스 검증
        const expectedSequence = sequence;
        const receivedSequence = client.buffer.readUInt32BE(
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
        const payloadLength = client.buffer.readUInt32BE(
          packetTypeByte + versionLengthByte + versionByte + sequenceByte,
        );

        if (client.buffer.length >= headerLength + payloadLength) {
          const packetType = client.buffer.readUInt16BE(0);
          const payloadBuffer = client.buffer.slice(headerLength, headerLength + payloadLength);
          client.buffer = client.buffer.slice(headerLength + payloadLength);

          console.log('------------- 받는 값 -------------');
          console.log('type:', packetType);
          console.log('versionLength:', versionByte);
          console.log('version:', version);
          console.log('sequence:', receivedSequence);
          console.log('payloadLength:', payloadLength);
          //console.log('payload:', payload);
          console.log('-------------------------------');

          // S2C 패킷타입별 핸들러 실행
          let proto = null;
          let payload = null;
          switch (packetType) {
            case config.packetType.registerResponse:
              proto = getProtoMessages().S2CRegisterResponse;
              payload = proto.decode(payloadBuffer);
              // handler(client, payload)
              console.log('서버로부터 응답', payload);
              break;
            case config.packetType.loginResponse:
              proto = getProtoMessages().S2CLoginResponse;
              payload = proto.decode(payloadBuffer);
              // handler(client, payload)
              console.log('서버로부터 응답', payload);
              break;
            case config.packetType.matchStartNotification:
              proto = getProtoMessages().S2CMatchStartNotification;
              payload = proto.decode(payloadBuffer);
              // handler(client, payload)
              console.log('서버로부터 응답', JSON.stringify(payload, null, 2));
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
});

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

client.on('close', () => {
  console.log('Connection closed');
});

client.on('error', (err) => {
  console.error('Client error:', err);
});
