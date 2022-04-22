// const users = { 
//   "userRandomID": {
//     id: "userRandomID", 
//     email: "user@example.com", 
//     password: "purple-monkey-dinosaur"
//   },
//  "user2RandomID": {
//     id: "user2RandomID", 
//     email: "user2@example.com", 
//     password: "dishwasher-funk"
//   },
//   "aaa": {
//     id: "aaa", 
//     email: "a@a.com", 
//     password: "1234"
//   }
// }


const checkingUser = function (email, database) {
  let user;
  for (let key in database) {
    if (database[key].email === email) {
      user = database[key];
    }
  }
  return user;
}; 



// console.log(checkingUser('user@example.com', users));


module.exports = checkingUser;
// module.exports = checkingPass;