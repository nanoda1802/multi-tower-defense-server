import config from '../../config/configs.js';
import { roomSession, userSession } from '../../session/session.js';

/* 필요 환경변수 꺼내오기 */
const { packetType } = config;

/* 베이스 피격 처리 요청에 대한 핸들러 */
const attackBaseHandler = async (socket, payload) => {
  // [1] 요청 보낸 유저 찾기
  const user = userSession.getUser(socket);
  if (!user) return;
  // [2] 해당 유저가 속한 룸 찾기
  const room = roomSession.getRoom(user.roomId);
  if (!room) return;
  // [3] 해당 유저의 인게임 정보 찾기 (= Player 인스턴스)
  const player = room.getPlayer(user.id);
  if (!player) return;
  // [4] 모든 정보 조회에 성공했다면 해당 플레이어의 베이스 피격 처리
  const baseHp = player.base.damaged(payload.damage);
  // [5 A] 베이스 잔여 체력이 있다면 피격 처리에 대한 응답 패킷들 보냄
  if (baseHp > 0) room.sendNotification(player, packetType.monsterAttackBaseRequest, { baseHp });
  // [5 B] 베이스 체력 소진 시 게임 종료 처리
  else await roomSession.finishGame(room, user);

  /* 밑은 기존 코드 */
  // if (baseHp <= 0) {
  //   // 게임 오버 시 종료 시점을 클라이언트들에게 전달
  //   room.players.forEach((player) => {
  //     let packet;
  //     // player가 자신일 경우 패배, 상대방일 경우 승리 정보를 반환
  //     if (player.id === user.id)
  //       packet = makePacketBuffer(config.packetType.gameOverNotification, 0, { isWin: false });
  //     else packet = makePacketBuffer(config.packetType.gameOverNotification, 0, { isWin: true });
  //     player.socket.write(packet);
  //   });
  //   // 게임오버가 아닐 시 baseHp 업데이트 전송
  // } else {
  //   // // 피격된 base hp 동기화
  //   room.players.forEach((player) => {
  //     // player가 누구인지에 따라 isOpponent 조정
  //     let isOpponent;
  //     if (player.user.id === user.id) isOpponent = false;
  //     else isOpponent = true;
  //     // 패킷 생성 후 전달
  //     const packet = makePacketBuffer(config.packetType.updateBaseHpNotification, 0, {
  //       isOpponent,
  //       baseHp,
  //     });
  //     player.user.socket.write(packet);
  //   });
  // }
};

export default attackBaseHandler;
