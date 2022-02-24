const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
};

const urlsForUser = (id, database) => {
  const urls = {};
  for (const shortURL in database) {
    const {userID, longURL} = database[shortURL];
    if (userID === id) {
      urls[shortURL] = longURL;
    }
  }
  return urls;
};

const doesUserOwnURL = (ownedURLs, shortURL) => ownedURLs[shortURL] !== undefined;

const generateRandomString = () => Math.random().toString(36).slice(2, 8);

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  doesUserOwnURL
};