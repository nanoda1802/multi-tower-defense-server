import { roomSession, userSession } from '../../session/session.js';
import config from '../../config/configs.js';

/* 필요 환경변수 꺼내오기 */
const { packetType } = config;

/* 몬스터 생성 요청에 대한 핸들러 */
export const spawnMonsterHandler = (socket) => {
  // [1] 요청 보낸 유저 찾기
  const user = userSession.getUser(socket);
  // [2] 해당 유저가 속한 룸 찾기
  const room = roomSession.getRoom(user.roomId);
  if (!room) return;
  // [3] 해당 유저의 인게임 정보 찾기 (= Player 인스턴스)
  const player = room.getPlayer(user.id);
  // [4] 새 몬스터에 부여할 식별자 가져오고, 만약 10의 배수 번째 몬스터라면 monsterLevel 증가
  const monsterId = room.getMonsterId();
  if (monsterId % 10 === 0) room.increaseLevel();
  // [5] 몬스터 유형 랜덤 지정 위한 난수 번호 생성 (1 ~ 5)
  const monsterNumber = Math.ceil(Math.ceil(Math.random() * 10) / 2);
  // [6] 몬스터 생성 처리
  player.spawnMonster(monsterId, monsterNumber, room.monsterLevel);
  // [7] 생성 처리에 대한 패킷들 보냄
  room.sendNotification(player, packetType.spawnMonsterRequest, { monsterId, monsterNumber });

  /* 밑은 기존 코드 */
  // [2] 몬스터 데이터 player에 넣어주기
  // player.spawnMonster(monsterId, monsterNumber); //더 필요한 정보 있으면 넣어주기 유저 둘다 넣어줘야함
  // [3]  monsterId, monsterNumber 패킷으로 감싸기
  // let myPacket = makePacketBuffer(config.packetType.spawnMonsterResponse, 0, {monsterId, monsterNumber});
  // let enemyPacket = makePacketBuffer(config.packetType.spawnEnemyMonsterNotification, 0, {monsterId, monsterNumber});
  // [4] packet 보내주기
  // player.user.socket.write(myPacket);
  // player.user.socket.write(enemyPacket);
  //
  // room.players.forEach((player) => {
  //   let packet;
  //   if (player.user.id === user.id)
  //     packet = makePacketBuffer(config.packetType.spawnMonsterResponse, 0, {
  //       monsterId,
  //       monsterNumber,
  //     });
  //   else
  //     packet = makePacketBuffer(config.packetType.spawnEnemyMonsterNotification, 0, {
  //       monsterId,
  //       monsterNumber,
  //     });
  //   player.user.socket.write(packet);
  // });
};

//setMonster(monsterId, monsterNumber) =>player1, 2모두에게 들어가야함
