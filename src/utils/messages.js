const generateMessage = (userName, text) => {
  return {
    text,
    createdAt: new Date().getTime(),
    userName,
  };
};

module.exports = { generateMessage };
