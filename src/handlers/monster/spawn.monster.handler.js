import monsterData from '../../assets/monster.js';
import { roomSession, userSession } from '../../session/session.js';
import makePacketBuffer from '../../utils/send-packet/makePacket.js';
import config from '../../config/configs.js';

export const spawnMonsterHandler = (socket) => {
  //userId로 찾기??
  // [1] 필요한 데이터 가져오기
  const data = monsterData; // assets데이터 가져오기
  const monsterNumber = Math.ceil(Math.ceil(Math.random() * 10) / 2); //1~5 랜덤생성
  const user = userSession.getUser(socket); //소켓으로 유저 찾기
  const room = roomSession.getRoom(user.roomId); //유저로 룸 찾기
  if (!room) return;
  const player = room.getPlayer(user.id);
  const monsterId = room.getMonsterId(); //이거 잘 작동하는지 확인
  // [2] 몬스터 데이터 player에 넣어주기
  player.spawnMonster(monsterId, monsterNumber); //더 필요한 정보 있으면 넣어주기 유저 둘다 넣어줘야함
  // [3]  monsterId, monsterNumber 패킷으로 감싸기
  // let myPacket = makePacketBuffer(config.packetType.spawnMonsterResponse, 0, {monsterId, monsterNumber});
  // let enemyPacket = makePacketBuffer(config.packetType.spawnEnemyMonsterNotification, 0, {monsterId, monsterNumber});
  // [4] packet 보내주기
  // player.user.socket.write(myPacket);
  // player.user.socket.write(enemyPacket);

  room.players.forEach((player) => {
    let packet;
    if (player.user.id === user.id)
      packet = makePacketBuffer(config.packetType.spawnMonsterResponse, 0, {
        monsterId,
        monsterNumber,
      });
    else
      packet = makePacketBuffer(config.packetType.spawnEnemyMonsterNotification, 0, {
        monsterId,
        monsterNumber,
      });
    player.user.socket.write(packet);
  });
};

//setMonster(monsterId, monsterNumber) =>player1, 2모두에게 들어가야함
