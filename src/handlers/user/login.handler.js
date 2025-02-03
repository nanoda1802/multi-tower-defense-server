import { loginQueue, userSession } from '../../session/session.js';

/* 로그인 핸들러 */
const loginHandler = async (socket, payload) => {
  // [1] 요청 페이로드에서 아이디랑 비번 추출
  const { id, password } = payload;
  // [2] 로그인 요청한 유저 찾기
  const user = userSession.getUser(socket);
  // [3] 유저 인스턴스와 요청 정보를 로그인 대기열에 투입
  await loginQueue.enqueueUser(user, id, password);
};

export default loginHandler;
