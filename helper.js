const checkingUser = function(email, database) {
  let user;
  for (let key in database) {
    if (database[key].email === email) {
      user = database[key];
    }
  }
  return user;
};


const urlsForUser = function(id, database) {
  let output = {};

  for (let key in database) {
    if (database[key].userID === id) {
      output[key] = database[key];
    }
  }
  return output;
};


function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}


module.exports = {
  checkingUser,
  urlsForUser,
  generateRandomString,
};
