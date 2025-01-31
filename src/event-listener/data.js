import config from '../config/configs.js';
import { getProtoMessages } from '../init/load.proto.js';
import { userSession } from '../session/session.js';
import loginHandler from '../handlers/user/login.handler.js';
import registerHandler from '../handlers/user/register.handler.js';
import findMatchHandler from '../handlers/match/find.match.handler.js';
import purchaseTowerHandler from '../handlers/tower/purchase.tower.handler.js';
import { spawnMonsterHandler } from '../handlers/monster/spawn.monster.handler.js';
import attackMonsterHandler from '../handlers/tower/attack.monster.handler.js';
import attackBaseHandler from '../handlers/monster/attack.base.handler.js';
import { killMonsterHandler } from '../handlers/monster/kill.monster.handler.js';
import { printHeader } from '../utils/send-packet/printHeader.js';
import { makeRegisterResponse } from '../utils/send-packet/payload/response/game.response.js';
import { GlobalFailCode } from '../utils/send-packet/payload/game.data.js';
import onEnd from './end.js';

/* Data 이벤트 리스너 */
export const onData = (socket) => async (data) => {
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
        const user = userSession.getUser(socket);
        if(!user) return 
        let expectedSequence = user.getSequence();
        if (sequence !== expectedSequence) {
          console.log(
            `시퀀스 검증 실패. 기대 시퀀스:${expectedSequence}, 수신한 시퀀스:${sequence}`,
          );
          // 조작된 시퀀스 사용자 연결 종료 처리
          user.sendPacket(
            config.packetType.registerResponse,
            makeRegisterResponse(false, '시퀀스 검증 실패', GlobalFailCode.INVALID_REQUEST),
          );
          onEnd(socket)();
          return;
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

          // 디버깅 (조건식 조정하면서 원하는 패킷 확인 가능)
          // if (packetType === 7) {
          //   printHeader(packetType, versionByte, version, sequence, payloadLength, 'in');
          //   console.log('payload :', payload);
          // }

          // 패킷타입별 핸들러 실행
          switch (packetType) {
            case config.packetType.registerRequest:
              registerHandler(socket, payload);
              break;
            case config.packetType.loginRequest:
              loginHandler(socket, payload);
              break;
            case config.packetType.matchRequest:
              findMatchHandler(socket, payload);
              break;
            case config.packetType.towerPurchaseRequest:
              purchaseTowerHandler(socket, payload);
              break;
            case config.packetType.spawnMonsterRequest:
              spawnMonsterHandler(socket);
              break;
            case config.packetType.towerAttackRequest:
              attackMonsterHandler(socket, payload);
              break;
            case config.packetType.monsterAttackBaseRequest:
              attackBaseHandler(socket, payload);
              break;
            case config.packetType.gameEndRequest:
              // handler(socket, payload)
              break;
            case config.packetType.monsterDeathNotification:
              killMonsterHandler(socket, payload);
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
