import { getProtoMessages } from '../../init/load.proto.js';
import config from '../../config/configs.js';

function makePacketBuffer(packetType, sequence, payload) {
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

  if (packetType === 7) {
    console.log('------------- 주는 값 -------------');
    console.log('type:', packetType);
    console.log('versionLength:', versionLength);
    console.log('version:', version);
    console.log('sequence', sequence);
    console.log('payload', payload);
    console.log('message', message);
    console.log('payloadLength', payloadLength);
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
