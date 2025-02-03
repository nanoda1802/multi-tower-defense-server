# multi-tower-defense

### 프로젝트 소개

1대1 경쟁 타워 디펜스 게임의 서버를 구현한 프로젝트입니다. Node.js의 `Net` 모듈을 기반으로 **TCP 소켓 통신 방식**을 채택했으며, 클라이언트와 주고받는 패킷은 `protobuf`를 바탕으로 구조를 설계했습니다. 서버의 주요 기능들은 다음과 같습니다!

- 유저 관리 (회원가입, 로그인, 전적 연동 등)
- 매치 관리 (mmr 연산, 매치메이킹 대기열 등)
- 인게임 오브젝트 관리 (몬스터, 타워, 본부 등)

---

### 주안점

> 미리 제작된 클라이언트에 최적화된 서버를 구현하기

### 활용 라이브러리

- protobufjs
- mysql2
- elo-rank
- uuid
- jsonwebtoken
- bcrypt
- dotenv

---

### 디렉토리 구조

```
📦src
 ┣ 📂assets
 ┃ ┣ 📜monster.js
 ┃ ┗ 📜tower.js
 ┣ 📂class
 ┃ ┣ 📂in-game
 ┃ ┃ ┣ 📜base.class.js
 ┃ ┃ ┣ 📜monster.class.js
 ┃ ┃ ┣ 📜player.class.js
 ┃ ┃ ┗ 📜tower.class.js
 ┃ ┣ 📂queue
 ┃ ┃ ┣ 📜login.queue.class.js
 ┃ ┃ ┗ 📜waiting.queue.class.js
 ┃ ┣ 📂room
 ┃ ┃ ┣ 📜room.class.js
 ┃ ┃ ┗ 📜room.session.class.js
 ┃ ┗ 📂user
 ┃ ┃ ┣ 📜user.class.js
 ┃ ┃ ┗ 📜user.session.class.js
 ┣ 📂config
 ┃ ┣ 📂constants
 ┃ ┃ ┣ 📜game.js
 ┃ ┃ ┗ 📜user.js
 ┃ ┣ 📂env
 ┃ ┃ ┗ 📜env.js
 ┃ ┣ 📂packet
 ┃ ┃ ┣ 📜header.js
 ┃ ┃ ┗ 📜packet.type.js
 ┃ ┗ 📜configs.js
 ┣ 📂database
 ┃ ┣ 📂migration
 ┃ ┃ ┗ 📜createSchemas.js
 ┃ ┣ 📂sql
 ┃ ┃ ┗ 📜user_db.sql
 ┃ ┣ 📂user_db
 ┃ ┃ ┣ 📜functions.js
 ┃ ┃ ┗ 📜queries.js
 ┃ ┣ 📜createPool.js
 ┃ ┗ 📜pools.js
 ┣ 📂event-listener
 ┃ ┣ 📜connect.js
 ┃ ┣ 📜data.js
 ┃ ┣ 📜end.js
 ┃ ┗ 📜error.js
 ┣ 📂handlers
 ┃ ┣ 📂match
 ┃ ┃ ┗ 📜find.match.handler.js
 ┃ ┣ 📂monster
 ┃ ┃ ┣ 📜attack.base.handler.js
 ┃ ┃ ┣ 📜kill.monster.handler.js
 ┃ ┃ ┗ 📜spawn.monster.handler.js
 ┃ ┣ 📂tower
 ┃ ┃ ┣ 📜attack.monster.handler.js
 ┃ ┃ ┗ 📜purchase.tower.handler.js
 ┃ ┗ 📂user
 ┃ ┃ ┣ 📜login.handler.js
 ┃ ┃ ┗ 📜register.handler.js
 ┣ 📂init
 ┃ ┣ 📜init.server.js
 ┃ ┗ 📜load.proto.js
 ┣ 📂protobuf
 ┃ ┣ 📜main.proto
 ┃ ┗ 📜packetNames.js
 ┣ 📂session
 ┃ ┗ 📜session.js
 ┣ 📂utils
 ┃ ┣ 📂path
 ┃ ┃ ┗ 📜make.monster.path.js
 ┃ ┗ 📂send-packet
 ┃ ┃ ┣ 📂payload
 ┃ ┃ ┃ ┣ 📂notification
 ┃ ┃ ┃ ┃ ┗ 📜game.notification.js
 ┃ ┃ ┃ ┣ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜game.response.js
 ┃ ┃ ┃ ┗ 📜game.data.js
 ┃ ┃ ┣ 📜makePacket.js
 ┃ ┃ ┗ 📜printHeader.js
 ┣ 📜client.js
 ┗ 📜server.js
```
