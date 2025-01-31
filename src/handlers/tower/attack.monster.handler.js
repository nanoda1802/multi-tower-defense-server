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
  if (!player) return;
  // [5] 해당 플레이어에서 공격한 타워 정보 찾기
  const tower = player.getTower(towerId);
  if (!tower) return;
  // [6] 해당 플레이어에서 피격당한 몬스터 정보 찾기
  const monster = player.getMonster(monsterId);
  if (!monster) return;
  // [7] 모든 정보 조회에 성공했다면 타워의 공격 처리
  tower.attackMonster(monster);
  // [8] 공격 처리에 대한 패킷들 보냄
  room.sendNotification(player, packetType.towerAttackRequest, { towerId, monsterId });

  /* 밑은 기존 코드 */
  // room.players.forEach((player) => {
  //   // 자신을 제외한 상대에게 티워 공격 정보 반환
  //   if (player.user.id === user.id) return;
  //   const packet = makePacketBuffer(config.packetType.enemyTowerAttackNotification, 0, {
  //     towerId,
  //     monsterId,
  //   });
  //   player.user.socket.write(packet);
  // });
};

export default attackMonsterHandler;
