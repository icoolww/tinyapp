

const checkingUser = function (email, database) {
  let user;
  for (let key in database) {
    if (database[key].email === email) {
      user = database[key];
    }
  }
  return user;
}; 


module.exports = checkingUser;
