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
const PORT = 5551;

const client = new net.Socket();

client.connect(PORT, HOST, async () => {
  console.log('Connectied to server');
  await loadProtos();
  //console.log(Object.keys(getProtoMessages()));

  try {
    const registerRequestPayload = { id: 'test_id', password: '1234', email: 'test@gmail.com' };
    const loginRequestPayload = { id: 'test_id', password: 'test_1234' };
    const matchRequestPayload = {};

    sendPacketBuffer(config.packetType.registerRequest, registerRequestPayload);

    console.log('C2S 매칭요청 패킷 전송 완료');
  } catch (error) {
    console.log('C2S 매칭요청 패킷 전송 실패');
    console.error(error);
  }
});

// 버퍼로 변환 및 송신
function sendPacketBuffer(type, payload) {
  let proto;
  switch (type) {
    case config.packetType.registerRequest:
      proto = getProtoMessages().C2SRegisterRequest;
      break;
    case config.packetType.loginRequest:
      proto = getProtoMessages().C2SLoginRequest;
      break;
    case config.packetType.matchRequest:
      proto = getProtoMessages().C2SMatchRequest;
      break;
    default: {
      console.log('타입에 해당하는 프로토메시지를 찾을 수 없음');
      console.log('프로토메시지 목록');
      console.log(Object.keys(getProtoMessages()));
      console.log('입력된 타입:', type);
      process.exit;
    }
  }

  // 페이로드   #FIXME : type->getProto->encode
  //const payloadBuffer = Buffer.from(payload);
  const payloadBuffer = proto.encode(payload).finish();

  // 헤더 필드값
  const version = config.env.clientVersion || '1.0.0';
  const versionLength = version.length;
  const sequence = 0;
  const payloadLength = payloadBuffer.length;

  console.log('------------- 헤더 -------------');
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

  client.write(packetBuffer);
}

client.on('data', (data) => {
  // const totalLength = data.readUInt32BE(0);
  // const packetType = data.readUInt8(4);
  // const payloadBuffer = data.slice(5, totalLength + 5);
  // switch (packetType) {
  //   case PACKET_TYPE.INIT:
  //     const initProto = getProtoMessages().response.Init;
  //     const responseInitPayload = initProto.decode(payloadBuffer);
  //     console.log('Init 패킷 응답받음');
  //     console.log('userId:', responseInitPayload.userId);
  //     console.log('message:', responseInitPayload.message);
  //     break;
  //   case PACKET_TYPE.LOCATION:
  //     const locationProto = getProtoMessages().response.LocationUpdate;
  //     const responseLocationPayload = locationProto.decode(payloadBuffer);
  //     console.log('Location 패킷 응답받음');
  //     console.log('x:', responseLocationPayload.x, 'y:', responseLocationPayload.y);
  //     console.log('message:', responseLocationPayload.message);
  //     break;
  // }
});

// 페이로드 구성 함수 prameter -> payload(object)
function createRegisterRequestPayload(id, password, email) {
  return { id, password, email };
}

function createLoginRequestPayload(id, password) {
  return { deviceId };
}

function createMatchRequestPayload() {
  return {};
}

function delay(ms) {
  new Promise((res) => setTimeout(res, ms));
}

client.on('close', () => {
  console.log('Connection closed');
});

client.on('error', (err) => {
  console.error('Client error:', err);
});
