import config from '../../config/configs.js';
import { roomSession, userSession } from '../../session/session.js';

/* 필요 환경변수 꺼내오기 */
const { packetType } = config;

/* 타워 구매 요청에 대한 핸들러 */
const purchaseTowerHandler = (socket, payload) => {
  // [1] 페이로드에서 데이터 꺼내기
  const { x, y } = payload;
  // [2] 요청 보낸 유저 찾기
  const user = userSession.getUser(socket);
  if (!user) return;
  // [3] 해당 유저가 속한 룸 찾기
  const room = roomSession.getRoom(user.roomId);
  if (!room) return;
  // [4] 해당 유저의 인게임 정보 찾기 (= Player 인스턴스)
  const player = room.getPlayer(user.id);
  // [5] 모든 정보 조회에 성공했다면 타워 설치 처리 및 설치된 타워의 식별자 가져오기
  const towerId = player.placeTower(room, x, y);
  // [6] 설치에 실패했다면 핸들러 종료
  if (!towerId) return;
  // [7] 보낼 정보들 갈무리
  const data = [
    {
      id: user.id,
      packetType: packetType.towerPurchaseResponse,
      payload: { towerId },
    },
    {
      id: player.opponentId,
      packetType: packetType.addEnemyTowerNotification,
      payload: { towerId, x, y },
    },
  ];
  // [8] 보냄
  room.notify(data);
};

export default purchaseTowerHandler;
