import { v4 as uuidv4 } from 'uuid';
import Room from './room.class.js';
import config from '../../config/configs.js';
import { userSession } from '../../session/session.js';
import makePath from '../../utils/path/make.monster.path.js';
import makePacketBuffer from '../../utils/send-packet/makePacket.js';
import {
  makeBaseData,
  makeGameState,
  makeInitialGameState,
} from '../../utils/send-packet/payload/game.data.js';
import { makeMatchStartNotification } from '../../utils/send-packet/payload/notification/game.notification.js';
import { updateUserData } from '../../database/user_db/functions.js';

class RoomSession {
  // 룸 새션입니다!
  rooms = new Map();

  addRoom(users) {
    const roomId = uuidv4();
    const newRoom = new Room(roomId, users);
    this.rooms.set(roomId, newRoom);
    this.startMatch(newRoom);
    for (const user of users) {
      user.playing();
    }
  }

  startMatch(room) {
    let monsterPath = {};
    let playerData = {};
    const playerId = [];
    //초기값
    const initialGameState = makeInitialGameState(
      config.game.baseHp,
      config.game.towerCost,
      config.game.initialGold,
      config.game.monsterSpawnInterval,
    );

    //길만들기 // 객체 형태로 관리해 달라고 요청 하기.
    room.players.forEach((player) => {
      monsterPath[player.user.id] = makePath(5);
      playerData[player.user.id] = makeGameState(
        player.gold,
        makeBaseData(player.base.hp, player.base.maxHp),
        player.user.highScore,
        [],
        [],
        room.monsterLevel,
        player.score,
        monsterPath[player.user.id],
        monsterPath[player.user.id][monsterPath[player.user.id].length - 1],
      );
      playerId.push(player.user.id);
    });

    // 전달
    room.players.forEach((player) => {
      const S2CMatchStartNotification = makeMatchStartNotification(
        initialGameState,
        playerData[player.user.id],
        playerData[playerId.find((e) => e !== player.user.id)],
      );
      const packet = makePacketBuffer(
        config.packetType.matchStartNotification,
        userSession.getUser(player.user.socket).sequence,
        S2CMatchStartNotification,
      );
      player.user.socket.write(packet);
    });
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getAllRoom() {
    return this.rooms;
  }

  /* 룸 세션에서 매치 종료된 룸 제거 */
  deleteRoom(roomId) {
    // [1] 종료시킬 룸 검색
    const room = this.rooms.get(roomId);
    // [2] 룸 비우고, 소속 유저들 roomId도 초기화
    room.clearRoom();
    // [3] 처리 끝난 룸 제거
    this.rooms.delete(roomId);
  }

  async finishMatch(room, user) {
    // [1] 매치 결과 기록할 객체 생성
    const matchResult = { winner: '', loser: '' };
    // [2] 플레이어 별로 결과 적용
    room.players.forEach((player, playerId) => {
      // [2-1] 승패 판정 (패배한 user가 호출하게 됨)
      const isWin = playerId === user.id ? false : true;
      if (isWin) matchResult.winner = playerId;
      else matchResult.loser = playerId;
      // [2-2] gameOverNotification 패킷 만들어 전송
      player.user.sendPacket(config.packetType.gameOverNotification, { isWin });
      // [2-3] 전적 및 최고 기록 최신화
      player.user.updateMatchRecord(isWin, player.score);
    });
    // [3] 각 유저 mmr 최신화
    room.updateMmr(matchResult);
    // [4] 룸 세션에서 매치 종료된 룸 제거
    this.deleteRoom(room.id);
    // [5] 전적과 mmr, 하이스코어 데이터베이스에 저장
    try {
      await updateUserData(
        user.matchRecord.win,
        user.matchRecord.lose,
        user.mmr,
        user.highScore,
        user.key,
      );
    } catch (error) {
      console.error(`로그아웃 처리 중 문제 발생!! `, error);
    }
  }
}

export default RoomSession;
