import RoomSession from '../class/room/room.session.class.js';
import UserSession from '../class/user/user.session.class.js';
import WaitingQueue from '../class/queue/waiting.queue.class.js';

const userSession = new UserSession();
const roomSession = new RoomSession();
const waitingQueue = new WaitingQueue();

export { userSession, roomSession, waitingQueue };
