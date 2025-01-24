import config from '../config/configs.js';
import { getProtoMessages } from '../init/load.proto.js';
import {
  makeLoginResponse,
  makeRegisterResponse,
  makeSpawnMonsterResponse,
  makeTowerPurchaseResponse,
} from '../utils/send-packet/payload/response/game.response.js';
import makePacketBuffer from '../utils/send-packet/makePacket.js';
import { userSession } from '../session/session.js';
import { makeMatchStartNotification } from '../utils/send-packet/payload/notification/game.notification.js';
import {
  makeBaseData,
  makeGameState,
  makeInitialGameState,
  makeMonsterData,
  makePosition,
  makeTowerData,
} from '../utils/send-packet/payload/game.data.js';
import loginHandler from '../handlers/user/login.handler.js';
import registerHandler from '../handlers/user/register.handler.js';
import addMatchHandler from '../handlers/match/add.match.handler.js';

export const onData = (socket) => async (data) => {
  // // | **필드 명** | **타입** | **설명** |
  // // | --- | --- | --- |
  // // | packetType | ushort | 패킷 타입 (2바이트) |
  // // | versionLength | ubyte | 버전 길이 (1바이트) |
  // // | version | string | 버전 (문자열) |
  // // | sequence | uint32 | 패킷 번호 (4바이트) |
  // // | payloadLength | uint32 | 데이터 길이 (4바이트) |
  // // | payload | bytes | 실제 데이터 |
  try {
    socket.buffer = Buffer.concat([socket.buffer, data]);

    const packetTypeByte = config.header.typeByte;
    const versionLengthByte = config.header.versionLengthByte;
    let versionByte = null;
    const sequenceByte = config.header.sequenceByte;
    const payloadLengthByte = config.header.payloadLengthByte;

    while (socket.buffer.length >= packetTypeByte + versionLengthByte) {
      versionByte = socket.buffer.readUInt8(packetTypeByte);
      while (
        socket.buffer.length >=
        packetTypeByte + versionLengthByte + versionByte + sequenceByte + payloadLengthByte
      ) {
        // 버전 검증
        let versionOffset = packetTypeByte + versionLengthByte;
        const version = socket.buffer.slice(versionOffset, versionOffset + versionByte).toString();
        verifyClientVersion(version);

        // 시퀀스 검증
        const sequence = socket.buffer.readUInt32BE(
          packetTypeByte + versionLengthByte + versionByte,
        );
        let expectedSequence = userSession.getUser(socket).getSequence();
        if (sequence === expectedSequence) {
          console.log('시퀀스 검증 통과');
        } else {
          console.log(`시퀀스 에러. 기대 시퀀스:${expectedSequence}, 수신한 시퀀스:${sequence}`);
          return; // 기대 시퀀스가 올 때까지 패킷 무시
        }

        const headerLength =
          packetTypeByte + versionLengthByte + versionByte + sequenceByte + payloadLengthByte;
        const payloadLength = socket.buffer.readUInt32BE(
          packetTypeByte + versionLengthByte + versionByte + sequenceByte,
        );

        if (socket.buffer.length >= headerLength + payloadLength) {
          const packetType = socket.buffer.readUInt16BE(0);
          const payloadBuffer = socket.buffer.slice(headerLength, headerLength + payloadLength);
          socket.buffer = socket.buffer.slice(headerLength + payloadLength);

          const proto = getProtoMessages().GamePacket;
          const gamePacket = proto.decode(payloadBuffer);
          const payload = gamePacket[gamePacket.payload];

          console.log('------------- 받는 값 -------------');
          console.log('type:', packetType);
          console.log('versionLength:', versionByte);
          console.log('version:', version);
          console.log('sequence', sequence);
          console.log('payloadLength', payloadLength);
          console.log('payload', payload);
          console.log('-------------------------------');

          // C2S 패킷타입별 핸들러 실행
          let response = null;
          let responsePacket = null;
          switch (packetType) {
            case config.packetType.registerRequest:
              registerHandler(socket, payload);
              break;
            case config.packetType.loginRequest:
              loginHandler(socket, payload);
              break;
            case config.packetType.matchRequest:
              addMatchHandler(socket, payload)
              break;
            case config.packetType.towerPurchaseRequest:
              // towerPurchaseHandler(socket, payload)
              response = makeTowerPurchaseResponse(1);
              responsePacket = makePacketBuffer(
                config.packetType.towerPurchaseResponse,
                userSession.getUser(socket).sequence,
                response,
              );
              socket.write(responsePacket);
              break;
            case config.packetType.spawnMonsterRequest:
              // handler(socket, payload)
              response = makeSpawnMonsterResponse(1, 1);
              responsePacket = makePacketBuffer(
                config.packetType.spawnMonsterResponse,
                userSession.getUser(socket).sequence,
                response,
              );
              socket.write(responsePacket);
              break;
            case config.packetType.towerAttackRequest:
              // handler(socket, payload)
              break;
            case config.packetType.monsterAttackBaseRequest:
              // handler(socket, payload)
              break;
            case config.packetType.gameEndRequest:
              // handler(socket, payload)
              break;
            case config.packetType.monsterDeathNotification:
              // handler(socket, payload)
              break;
            default:
              console.log('정의되지 않은 패킷 타입 : ', packetType);
              break;
          }
        }
      }
    }
  } catch (error) {
    console.log('패킷 수신 오류');
    console.error(error);
  }
};

const verifyClientVersion = (clientVersion) => {
  if (clientVersion !== config.env.clientVersion) {
    throw new Error(`클라이언트 버전 검증 오류 ${clientVersion}`);
  }
};

export default onData;
