import { v4 as uuidv4 } from 'uuid';
import Room from './room.class.js';
import config from '../../config/configs.js';
import makePath from '../../utils/path/make.monster.path.js';
import {
  makeBaseData,
  makeGameState,
  makeInitialGameState,
} from '../../utils/send-packet/payload/game.data.js';
import { makeMatchStartNotification } from '../../utils/send-packet/payload/notification/game.notification.js';
import { updateUserData } from '../../database/user_db/functions.js';

/* 필요한 환경변수 꺼내오기 */
const { game, packetType } = config;

/* RoomSession 클래스 */
class RoomSession {
  rooms = new Map(); // 룸들 관리할 Map 인스턴스

  /* 룸 생성 */
  addRoom(users) {
    // [1] 난수 생성해 key로 활용할 roomId 부여
    const roomId = uuidv4();
    // [2] 신규 룸 생성해 룸 세션에 투입
    const newRoom = new Room(roomId, users);
    this.rooms.set(roomId, newRoom);
    // [3] 클라이언트에 매치 시작 패킷 보내기
    this.startGame(newRoom);
    // [4] 유저들 state를 "Playing"으로 변경
    for (const user of users) {
      user.playing();
    }
  }

  /* 매치 종료된 룸 제거 */
  deleteRoom(roomId) {
    // [1] 종료시킬 룸 검색
    const room = this.rooms.get(roomId);
    // [2] 룸 비우고, 소속 유저들 roomId도 초기화
    room.clearRoom();
    // [3] 처리 끝난 룸 제거
    this.rooms.delete(roomId);
  }

  /* 특정 룸 조회하는 메서드 */
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  /* 게임 시작 통신하는 메서드 */
  startGame(room) {
    // [1] 두 플레이어의 각 gameState를 담을 빈 객체 준비
    const playerData = {};
    // [2] initialGameState 준비, 얘는 공통 정보
    const initialGameState = makeInitialGameState(
      game.baseHp,
      game.towerCost,
      game.initialGold,
      game.monsterSpawnInterval,
    );
    // [3] 각 플레이어의 gameState 준비
    room.players.forEach((player, playerId) => {
      // [3-1] 몬스터 경로 생성
      const monsterPath = makePath(game.pathCount); // pathCount는 경로가 꺾이는 횟수, 지금은 다섯 번
      // [3-2] 프로토버프 정의에 맞게 gameState 준비
      const gameState = makeGameState(
        player.gold, // 보유 골드
        makeBaseData(player.base.hp, player.base.maxHp), // 베이스 정보
        player.user.highScore, // 최고 점수
        [], // 보유 타워 목록
        [], // 스폰된 몬스터 목록
        room.monsterLevel, // 몬스터 레벨
        player.score, // 획득 점수
        monsterPath, // 생성한 몬스터 경로
        monsterPath.at(-1), // 베이스가 설치될 위치 (몬스터 경로의 마지막 지점)
      );
      // [3-3] 플레이어의 아이디로 식별할 수 있도록 객체에 할당
      playerData[playerId] = gameState;
    });
    // [4] 준비한 gameState 각 플레이어에게 전송
    room.players.forEach((player, playerId) => {
      // [4-1] 프로토버프 정의에 맞게 페이로드 준비
      const S2CMatchStartNotification = makeMatchStartNotification(
        initialGameState, // 초기 정보
        playerData[playerId], // 본인의 정보
        playerData[player.opponentId], // 상대의 정보
      );
      // [4-2] 패킷 송신
      player.user.sendPacket(packetType.matchStartNotification, S2CMatchStartNotification);
    });
  }

  /* 게임 종료 통신 및 처리하는 메서드 */
  async finishGame(room, user) {
    // [1] 매치 결과 기록할 객체 생성
    const matchResult = { winner: null, loser: null };
    // [2] 플레이어 별로 결과 적용
    room.players.forEach((player, playerId) => {
      // [2-1] 승패 판정 (패배한 user가 호출하게 됨)
      const isWin = playerId === user.id ? false : true;
      if (isWin) matchResult.winner = player.user;
      else matchResult.loser = player.user;
      // [2-2] gameOverNotification 패킷 만들어 전송
      player.user.sendPacket(packetType.gameOverNotification, { isWin });
      // [2-3] 전적 및 최고 기록 최신화
      player.user.updateMatchRecord(isWin, player.score);
    });
    // [3] 각 유저 mmr 최신화
    room.updateMMR(matchResult);
    // [4] 룸 세션에서 매치 종료된 룸 제거
    this.deleteRoom(room.id);
    // [5] 전적과 mmr, 하이스코어 데이터베이스에 저장
    try {
      await updateUserData(matchResult.winner, matchResult.loser);
    } catch (error) {
      console.error(`매치 결과 기록 중 문제 발생!! `, error);
    }
  }
}

export default RoomSession;
