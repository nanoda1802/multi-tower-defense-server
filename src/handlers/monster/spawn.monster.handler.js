import monsterData from "../../assets/monster.js"
import { roomSession, userSession } from "../../session/session.js";
import makePacketBuffer from "../../utils/send-packet/makePacket.js";
import config from "../../config/configs.js"

export const spawnMonsterHandler = (socket) => { //userId로 찾기??
        // [1] 필요한 데이터 가져오기
        const data = monsterData; //assets데이터 가져오기
        const monsterId = 1++; //이거 잘 작동하는지 확인
        const monsterNumber = 1;//Math.ceil(Math.ceil(Math.random()*10)/2) //1~5 랜덤생성
        const user = userSession.getUser(socket); //소켓으로 유저 찾기
        const room = roomSession.getRoom(user.roomId); //유저로 룸 찾기
        const player = room.getPlayer(socket);
        // [2] 몬스터 데이터 player에 넣어주기
        player.setMonster(monsterId, monsterNumber); //더 필요한 정보 있으면 넣어주기 유저 둘다 넣어줘야함
        // [3]  monsterId, monsterNumber 패킷으로 감싸기 
        let myPacket = makePacketBuffer(config.packetType.spawnMonsterRequest, 0, {monsterId, monsterNumber});
        let enemyPacket = makePacketBuffer(config.packetType.spawnEnemyMonsterNotification, 0, {monsterId, monsterNumber});
        // [4] packet 보내주기
        player.socket.write(myPacket);
        player.socket.write(enemyPacket);

        // room.players.forEach((player) => {
        //     if (player.id === user.id)
        //         myPacket = makePacketBuffer(config.packetType.spawnMonsterRequest, 0, {monsterId, monsterNumber});
        //     player.socket.write(myPacket)
        // }
}

//setMonster(monsterId, monsterNumber) =>player1, 2모두에게 들어가야함

