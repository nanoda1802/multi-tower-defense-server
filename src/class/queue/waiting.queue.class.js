import config from '../../config/configs.js';
import { roomSession } from '../../session/session.js';

/* WaitingQueue 클래스 */
class WaitingQueue {
  queue = new Set(); // 실질적으로 대기열 내 유저들 관리할 Set 인스턴스
  isMatchMaking = false; // 대기열의 상태 구분할 bool 프로퍼티
  mmrRange = config.game.mmrRange; // 매칭시킬 mmr 범위

  /* 유저를 대기열에 투입시키는 메서드 */
  enqueueUser(user) {
    // [1] 이미 대기열에 있는 유저인지 확인
    if (!this.queue.has(user)) {
      // [1-1] 아니라면 대기열에 유저를 넣어주고, 유저의 state를 "matchMaking"으로 변경
      this.queue.add(user);
      user.matchMaking();
    }
    // [2] 대기열에 존재하는 유저가 둘 이상이고, 대기열이 이미 매치메이킹 중이 아니라면 매치메이킹 시작
    if (this.queue.size > 1 && !this.isMatchMaking) {
      this.makeMatch();
    }
  }

  /* 대기열에서 유저를 제하는 메서드 */
  dequeueUser(user) {
    if (this.queue.has(user)) this.queue.delete(user);
  }

  /* 대기열 내 유저들을 매칭시키는 메서드 */
  makeMatch = () => {
    // [1] 대기열 내 유저가 한 명 뿐이면 리턴
    if (this.queue.size < 2) {
      this.isMatchMaking = false;
      return;
    }
    // [2] 매치가 성사됐는지 구분할 변수 선언
    let isMatchFound = false;
    // [3] 대기열의 상태 매치메이킹 중으로 변경
    if (!this.isMatchMaking) {
      this.isMatchMaking = true;
    }
    // [4] 대기열 순회하며 매치 성사 시도
    for (let targetUser of this.queue) {
      // [4-1] 어느 한 팀이 매치가 성사됐다면 반복 중단
      if (isMatchFound) {
        break;
      }
      // [4-2] mmr 범위 기준으로 적절한 상대 물색
      for (let user of this.queue) {
        // [4-2-1] 찾은 유저가 본인이라면 패스
        if (targetUser === user) {
          continue;
        }
        // [4-2-2] 찾은 유저와 본인의 mmr 차이가 적정 범위 내라면 매치 성사
        if (Math.abs(user.mmr - targetUser.mmr) <= this.mmrRange) {
          this.startMatch([targetUser, user]);
          isMatchFound = true;
          break;
        }
      }
    }
    // [5 A] 한 팀이라도 매치가 성사되지 않았다면 1초 후 재귀 실행
    if (!isMatchFound) {
      setTimeout(this.makeMatch, 1000);
    } else {
      // [5 B] 어느 하나의 매치가 성사됐다면 바로 재귀 실행
      this.makeMatch();
    }
  };

  /* 성사된 매치를 시작시키는 메서드 */
  startMatch(users) {
    // [1] 매칭된 두 유저를 대기열에서 제거
    const [userA, userB] = users;
    this.dequeueUser(userA);
    this.dequeueUser(userB);
    // [2] 두 유저를 위한 룸 생성
    roomSession.addRoom(users);

    /* 아래는 기존 코드!! */
    // for (let user of users) {
    //   this.dequeueUser(user);
    // }
  }
}

export default WaitingQueue;
