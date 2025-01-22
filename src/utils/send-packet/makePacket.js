import { getProtoMessages } from '../../init/load.proto.js';
import config from '../../config/configs.js';

function makePacketBuffer(packetType, payload) {
  //타입별 프로토메시지 메타데이터 가져오기
  let proto = null;
  switch (packetType) {
    case config.packetType.registerResponse:
      proto = getProtoMessages().S2CRegisterResponse;
      break;
    case config.packetType.loginResponse:
      proto = getProtoMessages().S2CLoginResponse;
      break;
    case config.packetType.matchRequest:
      proto = getProtoMessages().C2SMatchRequest;
      break;
    default: {
      console.log('타입에 해당하는 프로토메시지를 찾을 수 없음');
      console.log('프로토메시지 목록');
      console.log(Object.keys(getProtoMessages()));
      console.log('입력된 타입:', packetType);
      process.exit;
    }
  }

  // 페이로드
  const payloadBuffer = proto.encode(payload).finish();

  // 헤더 필드값
  const version = config.env.clientVersion || '1.0.0';
  const versionLength = version.length;
  const sequence = 0;
  const payloadLength = payloadBuffer.length;

  console.log('------------- 헤더 -------------');
  console.log('type:', packetType);
  console.log('versionLength:', versionLength);
  console.log('version:', version);
  console.log('sequence', sequence);
  console.log('payloadLength', payloadLength);
  console.log('-------------------------------');

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

  return packetBuffer;
}

export default makePacketBuffer;
