import config from '../config/configs.js';
import { getProtoMessages } from '../init/load.proto.js';
import {
  makeLoginResponse,
  makeRegisterResponse,
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
        let versionOffset = packetTypeByte + versionLengthByte;
        const version = socket.buffer.slice(versionOffset, versionOffset + versionByte).toString();

        // 버전 검증
        verifyClientVersion(version);

        const sequence = socket.buffer.readUInt32BE(
          packetTypeByte + versionLengthByte + versionByte,
        );

        if (sequence === userSession.getUser(socket).getSequence()) console.log('시퀀스 검증 통과');
        else console.log('시퀀스 오류');

        const headerLength =
          packetTypeByte + versionLengthByte + versionByte + sequenceByte + payloadLengthByte;
        const payloadLength = socket.buffer.readUInt32BE(
          packetTypeByte + versionLengthByte + versionByte + sequenceByte,
        );

        if (socket.buffer.length >= headerLength + payloadLength) {
          const packetType = socket.buffer.readUInt16BE(0);
          const payloadBuffer = socket.buffer.slice(headerLength, headerLength + payloadLength);
          socket.buffer = socket.buffer.slice(headerLength + payloadLength);

          console.log('------------- 헤더 -------------');
          console.log('type:', packetType);
          console.log('versionLength:', versionByte);
          console.log('version:', version);
          console.log('sequence', sequence);
          console.log('payloadLength', payloadLength);
          console.log('-------------------------------');

          // C2S 패킷타입별 핸들러 실행
          let proto = null;
          let payload = null;
          let response = null;
          let responsePacket = null;
          switch (packetType) {
            case config.packetType.registerRequest:
              proto = getProtoMessages().C2SRegisterRequest;
              payload = proto.decode(payloadBuffer);
              // handler(socket, payload)
              response = makeRegisterResponse(true, '가입요청 응답', 0);
              responsePacket = makePacketBuffer(
                config.packetType.registerResponse,
                userSession.getUser(socket).sequence,
                response,
              );
              socket.write(responsePacket);
              break;
            case config.packetType.loginRequest:
              proto = getProtoMessages().C2SLoginRequest;
              payload = proto.decode(payloadBuffer);
              // handler(socket, payload)
              response = makeLoginResponse(true, '로그인요청 응답', 'test@token', 0);
              responsePacket = makePacketBuffer(
                config.packetType.loginResponse,
                userSession.getUser(socket).sequence,
                response,
              );
              socket.write(responsePacket);
              break;
            case config.packetType.matchRequest:
              proto = getProtoMessages().C2SMatchRequest;
              payload = proto.decode(payloadBuffer);
              // handler(socket, payload)
              let initialGameState = makeInitialGameState(100, 100, 100, 5);
              let baseData = makeBaseData(100, 100);
              let towers = [];
              for (let i = 0; i < 5; i++) towers.push(makeTowerData(i, 0, 0));
              let monsters = [];
              for (let i = 0; i < 5; i++) monsters.push(makeMonsterData(i, i, 1));
              let monsterPath = [];
              for (let i = 0; i < 10; i++) monsterPath.push(makePosition(i, 0));
              let basePosition = makePosition(0, 0);
              let playerData = makeGameState(
                100,
                baseData,
                100,
                towers,
                monsters,
                1,
                10,
                monsterPath,
                basePosition,
              );
              let opponentData = makeGameState(
                100,
                baseData,
                100,
                towers,
                monsters,
                1,
                10,
                monsterPath,
                basePosition,
              );
              response = makeMatchStartNotification(initialGameState, playerData, opponentData);
              responsePacket = makePacketBuffer(
                config.packetType.matchStartNotification,
                userSession.getUser(socket).sequence,
                response,
              );
              socket.write(responsePacket);
              break;
            case config.packetType.towerPurchaseRequest:
              proto = getProtoMessages().C2STowerPurchaseRequest;
              payload = proto.decode(payloadBuffer);
              // handler(socket, payload)
              break;
            case config.packetType.towerPurchaseRequest:
              proto = getProtoMessages().C2SSpawnMonsterRequest;
              payload = proto.decode(payloadBuffer);
              // handler(socket, payload)
              break;
            case config.packetType.towerPurchaseRequest:
              proto = getProtoMessages().C2STowerAttackRequest;
              payload = proto.decode(payloadBuffer);
              // handler(socket, payload)
              break;
            case config.packetType.towerPurchaseRequest:
              proto = getProtoMessages().C2SMonsterAttackBaseRequest;
              payload = proto.decode(payloadBuffer);
              // handler(socket, payload)
              break;
            case config.packetType.towerPurchaseRequest:
              proto = getProtoMessages().C2SGameEndRequest;
              payload = proto.decode(payloadBuffer);
              // handler(socket, payload)
              break;
            case config.packetType.towerPurchaseRequest:
              proto = getProtoMessages().C2SMonsterDeathNotification;
              payload = proto.decode(payloadBuffer);
              // handler(socket, payload)
              break;
            default:
              console.log('패킷 타입 : ', packetType);
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
    throw new Error('클라이언트 버전 검증 오류');
  }
};

export default onData;
