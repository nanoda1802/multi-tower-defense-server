import { v4 as uuidv4 } from 'uuid';
import Room from './room.class.js';

class RoomSession {
  // 룸 새션입니다!
  rooms = new Map();

  addRoom(users) {
    const roomId = uuidv4();
    this.rooms[roomId] = new Room(roomId, users);
  }

  getRoom(roomId) {
    if (this.rooms[roomId] !== undefined) {
      return this.rooms[roomId];
    }
  }

  getAllRoom() {
    return this.rooms;
  }

  deleteRoom(roomId) {
    this.rooms.delete(roomId);
  }
  // 메서드 추가
}

export default RoomSession;
