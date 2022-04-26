const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const { checkingUser, urlsForUser, generateRandomString } = require('./helper.js');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


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
    email: "a@a.com", // pass 1234
    password: "$2a$10$IfaP0OmBkFSr8iSjzA.Nb.r7WvPg2XqfZPqjECsF.8HdZW81mD2xy"
  }
};
  
// Add an endpoint to handle a POST to /login in your Express server
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userFound = checkingUser(email, users);

  // throwing message if the email isn't match
  if (!userFound) {
    return res.status(403).send("email cannot be found");
  }
  // checking if encrypted password and users' password match, if not will send a message
  if (!bcrypt.compareSync(password, userFound.password)) {
    return res.status(403).send("email and password not match");
  }
  req.session.user_id = userFound.id;
  res.redirect(`/urls`);
});


// add an endpoint to handle a POST to /logout, clears endpoint
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

// handling edit display layout
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});


app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});


// handling from register page
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === "" && password === "") {
    return res.status(400).send("please enter your email and password");
  } else if (checkingUser(email, users)) {
    return res.status(400).send("your email has been registered, please enter another email ");
  } else if (password === "" || email === "") {
    return res.status(400).send("please recheck your email and address");
  }
  
  const newUserId = generateRandomString();

  const newUser = {
    id: newUserId,
    email: req.body.email,
    password: hashedPassword,
  };
  users[newUserId] = newUser;
  
  req.session.user_id = newUserId;
  res.redirect(`/urls`);
});


// creating new short URL by generating random string function
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userId = req.session.user_id;
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].userID = userId;
  res.redirect(`/urls/${shortURL}`);
});


// deleting URL and directing to main page
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});


// checking if valid user, otherwise redirect to login page
app.get("/", (req, res) => {
  if (!users[req.session.user_id]) {
    return res
      .status(403)
      .redirect(`/login`);
  }
  res.redirect(`/urls`);
});


// handling register layout, redirecting to main page
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  res
    .render("urls_registration", templateVars)
    .redirect(`/urls`);
});


// handling login page, redirecting to main page
app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  res
    .render("urls_login", templateVars)
    .redirect(`/urls`);
});


// handling main display, checking for valid user
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const urls = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: urls,
    user: users[id],
  };

  if (!users[id]) {
    return res
      .status(403)
      .send("please log in");
  }
  res.render("urls_index", templateVars);
});


// new url display, redirecting if not valid user
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (!users[req.session.user_id]) {
    return res
      .status(403)
      .redirect(`/login`);
  }
  res.render("urls_new", templateVars);
});


// edit display or going to long url display
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL] && urlDatabase[shortURL].longURL;
  const urlUserId = urlDatabase[shortURL] && urlDatabase[shortURL].userID;
  let errorMessage = "";
  
  if (!users[userId]) {
    errorMessage = "please log in";
  } else if (!urlDatabase[shortURL]) {
    errorMessage = "sorry, can not access, please add a new url";
  } else if (urlUserId !== userId) {
    errorMessage = "sorry, access is not granted";
  }
  
  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    url_userID: urlUserId,
    user: users[userId],
    errorMessage
  };
  res.render("urls_show", templateVars);
});

// redirect short URL to its long URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL])  {
    return res.status(410).send("Sorry, can not access.");
  }

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

