import net from 'net';
import onConnection from './event-listener/connect.js';
import initServer from './init/init.server.js';
import config from './config/configs.js';

/* 서버 생성 */
const server = net.createServer(onConnection);

/* 서버 시작 처리 위한 함수 */
const startServer = async () => {
  // [1] 서버 가동 시 필요한 초기 작업 (프로토버프 정의 로드 등등)
  await initServer();
  // [2] 서버 LISTEN 상태로 변경
  server.listen(config.env.port, config.env.host, () => {
    console.log(`서버를 가동합니다.`);
  });
};

/* 서버 실행 */
startServer();
