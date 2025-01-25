import { v4 as uuidv4 } from 'uuid';
import Room from './room.class.js';

class RoomSession {
  // 룸 새션입니다!
  rooms = new Map();

  addRoom(users) {
    const roomId = uuidv4();
    this.rooms.set(roomId, new Room(roomId, users));
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
}

export default RoomSession;
