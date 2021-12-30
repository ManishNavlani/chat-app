const users = [];

const addUser = ({ id, userName, room }) => {
  // cleaning fields
  userName = userName.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //   validate
  if (!userName || !room) {
    return { error: "Please provide complete details." };
  }

  //   check for existing user
  const existingUserName = users.find(
    (user) => user.room === room && user.userName === userName
  );

  if (existingUserName) {
    return { error: "UserName is used.Please choose other Username!" };
  }

  const user = { id, userName, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
