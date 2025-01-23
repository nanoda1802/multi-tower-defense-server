import onData from './data.js';
import onEnd from './end.js';
import onError from './error.js';
import { userSession } from '../session/session.js';

/* connection 이벤트 리스너  */
const onConnection = (socket) => {
  // [1] 연결된 클라의 "IP주소:PORT번호" 알림
  console.log(`새 클라 연결!! : ${socket.remoteAddress}:${socket.remotePort}`);
  // [2] 연결된 클라의 소켓 인스턴스에 buffer 속성 부여
  // 빈 버퍼 할당해놓고, 앞으로 패킷 통신 시 이 프로퍼티에 버퍼 형태로 담아 보내고 받을 것
  socket.buffer = Buffer.alloc(0);
  // [3] 이벤트 리스너 등록
  socket.on(`data`, onData(socket));
  socket.on(`end`, onEnd(socket));
  socket.on(`error`, onError(socket));
  // [4] 깡통 유저 생성
  userSession.setUser(socket);
};

export default onConnection;
