import { roomSession, userSession } from '../../session/session.js';
import config from '../../config/configs.js';

/* 필요 환경변수 꺼내오기 */
const { packetType } = config;

/* 몬스터 생성 요청에 대한 핸들러 */
export const spawnMonsterHandler = (socket) => {
  // [1] 요청 보낸 유저 찾기
  const user = userSession.getUser(socket);
  if (!user) return;
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
};
