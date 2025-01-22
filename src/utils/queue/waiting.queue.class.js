import { roomSession } from '../../session/session.js';

// 매치메이킹
class WaitingQueue {
  queue = new Set();
  isMatching = false;

  mmrRange = 100; //이거 상수로 넣을꺼임

  // 유저 매칭 시작시 넣어줌
  addQueue(user) {
    if (!this.queue.has(user)) {
      this.queue.add(user);
    }
    if (this.queue > 1 && !this.isMatching) {
      startMatch();
    }
  }
  // 유저 취소 용도
  dequeueUser(user) {
    if (!this.queue.has(user)) {
      this.queue.delete(user);
    }
  }
  // 매칭 시작
  startMatch() {
    if (this.queue.size < 2) {
      this.isMatching = false;
      return;
    }
    let isMatchFound = false;

    if (!this.isMatching) {
      this.isMatching = true;
    }

    for (let targetUser of this.queue) {
      if (isMatchFound) {
        break;
      }
      for (let user of this.queue) {
        if (targetUser === user) {
          continue;
        }
        if (Math.abs(user.mmr - targetUser.mmr) <= mmrRange) {
          this.onFoundMatch([targetUser, user]);
          isMatchFound = true;
          break;
        }
      }
    }
    setTimeout(startMatch, 1000);
  }
  //매칭 성공
  onFoundMatch(users) {
    for (let user of users) {
      dequeueUser(user);
    }
    roomSession.addRoom(users);
  }
}

export default WaitingQueue;
