import { roomSession, userSession } from '../../session/session';

const attackBaseHandler = (socket, payload) => {
  // 세션<>입력 검증 과정
  const user = userSession.getUser(socket);
  if (!user) return;
  const room = roomSession.getRoom(user.roomId);
  if (!room) return;
  const player = room.getPlayer(user.id);
  if (!player) return;

  player.base.damaged(room, payload.damage);
};

export default attackBaseHandler;
