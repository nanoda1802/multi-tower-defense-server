import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../../config/configs.js';
import { userSession } from '../../session/session.js';
import { GlobalFailCode } from '../../utils/send-packet/payload/game.data.js';
import { selectUserData } from '../../database/user_db/functions.js';

/* 응답 메세지 유형 */
const messageType = {
  user: '유저 정보를 찾을 수 없슴다!',
  duplicate: '이미 접속된 계정임다!',
  password: '비밀번호가 일치하지 않슴다!',
  none: '알 수 없는 이유로 로그인에 실패했슴다!',
  success: '로그인 성공임다!!',
};

/* LoginQueue 클래스 */
class LoginQueue {
  queue = new Map(); // 로그인 대기열
  isThereRequest = false; // 대기열 작동 중인지 확인하는 변수

  /* 로그인 시도한 유저 큐에 넣기 */
  async enqueueUser(user, id, password) {
    // [1] 이미 대기열에 존재하는지 확인 후, 대기열에 유저 투입
    if (!this.queue.has(user)) {
      this.queue.set(user, { id, password });
    } else return;
    // [2] 로그인 요청이 생겼으니 대기열을 작동 상태로 전환하고 로그인 시도
    if (!this.isThereRequest) {
      this.isThereRequest = true;
      await this.tryLogin();
    }
  }

  /* 로그인 완료한 유저 큐에서 빼기 */
  dequeueUser(user) {
    // [1] 유저 대기열에서 제외
    this.queue.delete(user);
    // [2] 대기열에 남은 유저가 없다면, 대기열을 대기 상태로 전환
    if (this.queue.size === 0) {
      this.isThereRequest = false;
    }
  }

  /* 로그인 시도 메서드 */
  async tryLogin() {
    while (this.isThereRequest) {
      // [1] 대기열의 첫번째 값 가져오기 (queue 방식 모방)
      const { id, password } = this.queue.values().next().value;
      const user = this.queue.keys().next().value;
      // [2] DB 조회 후 정보 검증하고 응답 페이로드 준비
      const responsePayload = await this.verifyLoginInfo(user, id, password);
      // [3] 패킷 버퍼로 변환해 클라이언트에 송신
      user.sendPacket(config.packetType.loginResponse, responsePayload);
      // [4] 모든 처리 완료된 유저는 대기열에서 제외
      this.dequeueUser(user);
    }
  }

  /* 실패 응답 페이로드 제작 메서드 */
  makeFailPayload(type = 'none') {
    // [1] 상황별 메세지 구분
    const message = messageType[type];
    // [2] 실패 응답 페이로드 반환
    return {
      success: false,
      message,
      token: 'empty',
      failCode: GlobalFailCode.INVALID_REQUEST,
    };
  }

  /* 요청받은 정보 검증 후 처리하고 적절한 페이로드 준비하는 메서드 */
  async verifyLoginInfo(user, id, password) {
    // [1] DB에서 유저 정보 가져오기 (쿼리 실행)
    let userData = null;
    try {
      userData = await selectUserData(id);
    } catch (err) {
      // [실패] 예외적인 오류 발생 시
      console.error(`로그인 처리 중 문제가 발생했습니다.\n`, err);
      return {
        success: false,
        message: `DB 문제 발생 : ${err.code}`,
        failCode: GlobalFailCode.UNKNOWN_ERROR,
      };
    }
    // [2] 요청된 유저와 일치하는 정보가 없는 경우
    if (!userData) return this.makeFailPayload('user');
    // [3] 이미 로그인된 계정인지 검증
    for (const account of userSession.users.values()) {
      if (account.id === userData.id) {
        return this.makeFailPayload('duplicate');
      }
    }
    // [4] 비밀번호 일치 여부 검증
    const isRightPassword = await bcrypt.compare(password, userData.password);
    if (!isRightPassword) return this.makeFailPayload('password');
    // [5] 모든 검증 통과 시 jwt 생성
    const token = jwt.sign({ userId: userData.id }, config.env.secretKey);
    // [6] 깡통 유저에 계정 정보 연동하기
    user.login(
      userData.user_key,
      userData.id,
      userData.win_count,
      userData.lose_count,
      userData.mmr,
      userData.high_score,
    );
    // [7] 성공 응답 페이로드 반환
    return { success: true, message: messageType.success, token, failCode: GlobalFailCode.NONE };
  }
}

export default LoginQueue;
