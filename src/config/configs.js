import { INITIAL_GOLD } from './constants/game.js';
import userState from './constants/user.js';
import env from './env/env.js';
import header from './packet/header.js';
import PacketType from './packet/packet.type.js';

const config = {
  header: {
    typeByte: header.TYPE_BYTE,
    versionLengthByte: header.VERSION_LENGTH_BYTE,
    sequenceByte: header.SEQUENCE_BYTE,
    payloadLengthByte: header.PAYLOAD_LENGTH_BYTE,
  },
  packetType: {
    registerRequest: PacketType.REGISTER_REQUEST,
    registerResponse: PacketType.REGISTER_RESPONSE,
    loginRequest: PacketType.LOGIN_REQUEST,
    matchRequest: PacketType.MATCH_REQUEST,
    matchStartNotification: PacketType.MATCH_START_NOTIFICATION,
    stateSyncNotification: PacketType.STATE_SYNC_NOTIFICATION,
    towerPurchaseRequest: PacketType.TOWER_PURCHASE_REQUEST,
    towerPurchaseResponse: PacketType.TOWER_PURCHASE_RESPONSE,
    addEnemyTowerNotification: PacketType.ADD_ENEMY_TOWER_NOTIFICATION,
    spawnMonsterRequest: PacketType.SPAWN_MONSTER_REQUEST,
    spawnMonsterResponse: PacketType.SPAWN_MONSTER_RESPONSE,
    spawnEnemyMonsterNotification: PacketType.SPAWN_ENEMY_MONSTER_NOTIFICATION,
    towerAttackRequest: PacketType.TOWER_ATTACK_REQUEST,
    enemyTowerAttackNotification: PacketType.ENEMY_TOWER_ATTACK_NOTIFICATION,
    monsterAttackBaseRequest: PacketType.MONSTER_ATTACK_BASE_REQUEST,
    updateBaseHpNotification: PacketType.UPDATE_BASE_HP_NOTIFICATION,
    gameOverNotification: PacketType.GAME_OVER_NOTIFICATION,
    gameEndRequest: PacketType.GAME_END_REQUEST,
    monsterDeathNotification: PacketType.MONSTER_DEATH_NOTIFICATION,
    enemyMonsterDeathNotification: PacketType.ENEMY_MONSTER_DEATH_NOTIFICATION,
  },
  env: {
    port: env.PORT,
    host: env.HOST,
    clientVersion: env.CLIENT_VERSION,
    db1Name: env.DB1_NAME,
    db1User: env.DB1_USER,
    db1Password: env.DB1_PASSWORD,
    db1Host: env.DB1_HOST,
    db1Port: env.DB1_PORT,
    secretKey: env.SECRET_KEY,
  },
  game: {
    initialGold: INITIAL_GOLD,
  },
  userState: {
    waiting: userState.WAITING,
    matchMaking: userState.MATCH_MAKING,
    gamePlaying: userState.GAME_PLAYING,
  },
};

export default config;
