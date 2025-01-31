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
  // [4] 모든 정보 조회에 성공했다면 해당 플레이어의 베이스 피격 처리
  const baseHp = player.base.damaged(payload.damage);
  // [5 A] 베이스 잔여 체력이 있다면 피격 처리에 대한 응답 패킷들 보냄
  if (baseHp > 0) room.sendNotification(player, packetType.monsterAttackBaseRequest, { baseHp });
  // [5 B] 베이스 체력 소진 시 게임 종료 처리
  else await roomSession.finishGame(room, user);
};

export default attackBaseHandler;
