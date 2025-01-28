import { roomSession, userSession } from '../../session/session.js';
import config from '../../config/configs.js';

/* 필요 환경변수 꺼내오기 */
const { packetType } = config;

/* 몬스터 처치 요청에 대한 핸들러 */
export const killMonsterHandler = (socket, payload) => {
  // [1] 페이로드에서 데이터 꺼내기
  const { monsterId } = payload;
  // [2] 요청 보낸 유저 찾기
  const user = userSession.getUser(socket);
  // [3] 해당 유저가 속한 룸 찾기
  const room = roomSession.getRoom(user.roomId);
  if (!room) return;
  // [4] 해당 유저의 인게임 정보 찾기 (= Player 인스턴스)
  const player = room.getPlayer(user.id);
  // [5] 서버 상에 존재하지 않는 몬스터 데이터라면 핸들러 종료
  if (!player.getMonster(monsterId)) return;
  // [6] 모든 정보 조회에 성공했다면 몬스터 처치 처리
  player.killMonster(monsterId);
  // [7] 처치 처리에 대한 패킷들 보냄
  room.sendNotification(player, packetType.monsterDeathNotification, { monsterId });

  /* 밑은 기존 코드 */
  // room.players.forEach((player) => {
  //   let packet;
  //   if (player.user.id === user.id) {
  //     packet = makePacketBuffer(
  //       config.packetType.stateSyncNotification,
  //       0,
  //       player.makeSyncPayload(),
  //     );
  //   } else {
  //     packet = makePacketBuffer(config.packetType.enemyMonsterDeathNotification, 0, {
  //       monsterId,
  //     });
  //   }
  //   player.user.socket.write(packet);
  // });
};

/* 
message C2SMonsterDeathNotification {
    int32 monsterId = 1;
}

message S2CEnemyMonsterDeathNotification {
    int32 monsterId = 1;
}
    내 클라이언트에서 몬스터 사망 처리시, 상대방 클라이언트에서도 사망처리
    */

//killMonster(monsterId) => state = 'alive' => 'dead' 로 바꿔줌
