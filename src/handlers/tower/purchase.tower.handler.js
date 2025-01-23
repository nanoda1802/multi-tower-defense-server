import config from "../../config/configs.js"
import { roomSession, userSession } from "../../session/session.js"
import makePacketBuffer from "../../utils/send-packet/makePacket.js"

const purchaseTowerHandler = (socket, payload) => {
    const { x, y } = payload

    // 서버 세션 내 정보 검증
    const user = userSession.getUser(socket)
    if(!user) return
    const room = roomSession.getRoom(user.roomId)
    if(!room) return
    const player = room.getPlayer(socket)
    if(!player) return 

    // 골드 확인 후 towerId 반환
    const towerId = player.placeTower(room,x,y);
    // 타워 설치 실패 시 끝
    if(towerId === -1) return 

    room.players.forEach((player) => {
        let packet
        // player가 자신일 경우 response, 상대방일 경우 notification 반환
        if (player.playerId === user.id)
            packet = makePacketBuffer(config.packetType.towerPurchaseResponse, { towerId })
        else
            packet = makePacketBuffer(config.packetType.addEnemyTowerNotification, { towerId, x, y })
        player.socket.write(packet)
    })
}

export default purchaseTowerHandler