const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const checkingUser = require('./helper.js');

const bcrypt = require('bcryptjs');
app.set("view engine", "ejs");
var cookieParser = require('cookie-parser');
const checkingPass = require("./helper.js");
app.use(cookieParser())


// const urlDatabase = {
  //   "b2xVn2": "http://www.lighthouselabs.ca",
  //   "9sm5xK": "http://www.google.com"
  // };
  
  const urlDatabase = {
    
    "b2xVn2": {
      longURL: "http://www.lighthouselabs.ca",
      userID: "userRandomID"
    },
    "9sm5xK": {
      longURL: "http://www.google.com",
      userID: "user2RandomID"
    }
  };
  
  // console.log(urlDatabase);
  
  
  function generateRandomString() {
    return Math.random().toString(36).slice(2, 8);
  };
  
  
  // Add an endpoint to handle a POST to /login in your Express server
  app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const userFound = checkingUser(email, users);
 
  // console.log('email', email);
  // console.log(userFound);
  
  if (!userFound) {
    return res.status(403).send("email cannot be found");
  }
  
  console.log('password', password);
  console.log('user pass', userFound.password);
  // checking user's password
  if (!bcrypt.compareSync(password, userFound.password)) {
    return res.status(403).send("email and password not match")
  }

  res
  .cookie("user_id", userFound.id)
  .redirect(`/urls`)
});




// Add an endpoint to handle a POST to /logout, clears endpoint
app.post("/logout", (req, res) => {
 
  res
  .clearCookie("user_id")
  .redirect(`/login`)
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  // urlDatabase[shortURL] = req.body.longURL; 
  res.redirect(`/urls/${shortURL}`)
});


app.post("/urls/:shortURL", (req, res) => {
  const userID = req.body.user_id;
  const shortURL = req.params.shortURL;
  // urlDatabase[shortURL] = req.body.longURL;

  // if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === userID){
  // }
  
  res.redirect(`/urls/`)
  console.log(shortURL); 
  // console.log(urlDatabase);
});

// register
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_registration", templateVars);
});


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "aaa": {
    id: "aaa", 
    email: "a@a.com", 
    password: "$2a$10$IfaP0OmBkFSr8iSjzA.Nb.r7WvPg2XqfZPqjECsF.8HdZW81mD2xy"
  }
}

// handling from register page
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // console.log(hashedPassword);

  if (email === "" && password === "") {
    return res.status(400).send("please enter your email and password");
  } else if (checkingUser(email, users)) {
    return res.status(400).send("your email has been registered, please enter another email ");
  } else if (password === "" || email === "") {
    return res.status(400).send("please recheck your email and address");
  }
  
  // create new user id
  const newUserId = generateRandomString();
  // create new user object
  const newUser = {
    id: newUserId,
    email: req.body.email,
    password: hashedPassword,
  }
  // save user to database
  users[newUserId] = newUser;
  
  console.log('users', users);
  // console.log('users', users);
  
  res
  .cookie('user_id', newUserId)
  .redirect(`/urls/`)
});

// login page
app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res
  .render("urls_login", templateVars)
  .redirect(`/urls/`)
});



app.get("/urls", (req, res) => {

  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };

  if (!req.cookies["user_id"]) {
    return res.status(403).send("please login");
  } 
  
  
  res.render("urls_index", templateVars);
});


// creating new short URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  // const userFound = checkingUser(email, users);
  // console.log('shortURL', shortURL);
  // console.log('longURL', longURL);
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL
  // console.log('urlDatabase', urlDatabase);

  // const email = req.body.email;


  // if (!userFound) {
  //   return res.status(403).send("please login");
  // } 


  res.redirect(`/urls/${shortURL}`)
});

// delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  delete urlDatabase[shortURL];
  res.redirect(`/urls/`);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  
  if (!templateVars.user){
    return res.redirect(`/login/`)
  }
  
  res.render("urls_new", templateVars);
});




app.get("/urls/:shortURL", (req, res) => {
  
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  
  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: users[req.cookies["user_id"]],
  };
  // console.log(templateVars);
  res.render("urls_show", templateVars);
  // res.redirect(`/urls/${  }`)
  
});


// redirect short URL to its long URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


const urlsForUser = function (id) {
    let output = {};

    for (let key in urlDatabase) {
      if (urlDatabase[key].user_id=== id) {
        output[key] = urlDatabase[key];
      }
    }
    return output;
}

// urlsForUser()