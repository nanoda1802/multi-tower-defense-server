import User from './user.class.js';

class UserSession {
  users = new Map();

  addUser(socket) {
    const newUser = new User(socket);
    this.users.set(socket, newUser);
    console.log('유저생성');
    return newUser;
  }

  getUser(socket) {
    return this.users.get(socket);
  }

  getAllUsers() {
    return this.users; // 객체나 배열로 바꿔서 줘야하나? 쓸 일이 있을까 근데?
  }

  deleteUser(socket) {
    this.users.delete(socket);
  }

  clearUserSession() {
    this.users.clear();
  }
}

export default UserSession;
