import net from 'net';
import onConnection from './event-listener/connect.js';
import initServer from './init/init.server.js';
import config from './config/configs.js';
import makePath from './utils/path/make.monster.path.js';

/* 서버 생성 */
const server = net.createServer(onConnection);

const startServer = async () => {
  await initServer();
  server.listen(config.env.port, config.env.host, () => {
    console.log(`서버 시작!!`);
    console.log(makePath(5));
    console.log(makePath(1));
    console.log(makePath(4));
  });
};

/* 서버 시작 */
startServer();
