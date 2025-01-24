import { getProtoMessages } from '../../init/load.proto.js';
import config from '../../config/configs.js';

function makePacketBuffer(packetType, sequence, payload) {
  //타입별 프로토메시지 메타데이터 가져오기
  let proto = null;
  switch (packetType) {
    case config.packetType.registerResponse:
      proto = getProtoMessages().S2CRegisterResponse;
      break;
    case config.packetType.loginResponse:
      proto = getProtoMessages().S2CLoginResponse;
      break;
    case config.packetType.matchStartNotification:
      proto = getProtoMessages().S2CMatchStartNotification;
      break;
    case config.packetType.stateSyncNotification:
      proto = getProtoMessages().S2CStateSyncNotification;
      break;
    case config.packetType.towerPurchaseResponse:
      proto = getProtoMessages().S2CTowerPurchaseResponse;
      break;
    case config.packetType.addEnemyTowerNotification:
      proto = getProtoMessages().S2CAddEnemyTowerNotification;
      break;
    case config.packetType.spawnMonsterResponse:
      proto = getProtoMessages().S2CSpawnMonsterResponse;
      break;
    case config.packetType.spawnEnemyMonsterNotification:
      proto = getProtoMessages().S2CSpawnEnemyMonsterNotification;
      break;
    case config.packetType.enemyTowerAttackNotification:
      proto = getProtoMessages().S2CEnemyTowerAttackNotification;
      break;
    case config.packetType.updateBaseHpNotification:
      proto = getProtoMessages().S2CUpdateBaseHPNotification;
      break;
    case config.packetType.gameOverNotification:
      proto = getProtoMessages().S2CGameOverNotification;
      break;
    case config.packetType.monsterDeathNotification:
      proto = getProtoMessages().C2SMonsterDeathNotification;
      break;
    case config.packetType.enemyMonsterDeathNotification:
      proto = getProtoMessages().S2CEnemyMonsterDeathNotification;
      break;
    default: {
      console.log('타입에 해당하는 프로토메시지를 찾을 수 없음');
      console.log('프로토메시지 목록');
      console.log(Object.keys(getProtoMessages()));
      let isPacketType = false;
      // config/cofigs.js에는 정의되지만 partobuf/packetNames.js에는 정의되지 않음.
      Object.entries(config.packetType).forEach(([type, num]) => {
        if (num === packetType) {
          isPacketType = true;
          console.log('존재하지 않는 프로토메시지:', type);
          return;
        }
      });
      // config/configs.js에 정의되되지 않음.
      if (!isPacketType) console.log('존재하지 않는 config.packetType:', packetType);
      process.exit;
    }
  }

  // 페이로드
  const payloadBuffer = proto.encode(payload).finish();

  // 헤더 필드값
  const version = config.env.clientVersion || '1.0.0';
  const versionLength = version.length;
  const payloadLength = payloadBuffer.length;

  console.log('------------- 주는 값 -------------');
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
