import config from '../../config/configs.js';
import { roomSession, userSession } from '../../session/session.js';

/* 필요 환경변수 꺼내오기 */
const { packetType } = config;

/* 타워의 공격 요청에 대한 핸들러 */
const attackMonsterHandler = (socket, payload) => {
  // [1] 페이로드에서 데이터 꺼내기
  const { towerId, monsterId } = payload;
  // [2] 요청 보낸 유저 찾기
  const user = userSession.getUser(socket);
  if (!user) return;
  // [3] 해당 유저가 속한 룸 찾기
  const room = roomSession.getRoom(user.roomId);
  if (!room) return;
  // [4] 해당 유저의 인게임 정보 찾기 (= Player 인스턴스)
  const player = room.getPlayer(user.id);
  // [5] 해당 플레이어에서 공격한 타워 정보 찾기
  const tower = player.getTower(towerId);
  if (!tower) return;
  // [6] 해당 플레이어에서 피격당한 몬스터 정보 찾기
  const monster = player.getMonster(monsterId);
  if (!monster) return;
  // [7] 모든 정보 조회에 성공했다면 타워의 공격 처리
  tower.attackMonster(monster);
  // [7] 보낼 정보들 갈무리
  const data = [
    {
      id: player.opponentId,
      packetType: packetType.enemyTowerAttackNotification,
      payload: { towerId, monsterId },
    },
  ];
  // [8] 보냄
  room.notify(data);
};

export default attackMonsterHandler;
