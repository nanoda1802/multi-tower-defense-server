import Player from '../in-game/player.class';

class Room {
  constructor(id, users) {
    id = id;
    this.players = new Map();
    setPlayers(users);
  }

  setPlayers(users) {
    for (let user of users) {
      this.players.set(user.socket, new Player(user.socket, this.id));
    }
  }

  getPlayer(socket) {
    if (this.players[socket] !== undefined) {
      return this.players[socket];
    }
  }
}

export default Room;
