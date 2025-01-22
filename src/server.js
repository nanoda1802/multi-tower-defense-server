import net from 'net';
import onConnection from './event-listener/connect.js';
import initServer from './init/init.server.js';
import config from './config/configs.js';

/* 서버 생성 */
const server = net.createServer(onConnection);

const startServer = async () => {
  await initServer();
  server.listen(config.env.port, config.env.host, () => {
    console.log(`서버 시작!!`);
  });
};

/* 서버 시작 */
startServer();
