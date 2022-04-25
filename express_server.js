const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const checkingUser = require('./helper.js');

const bcrypt = require('bcryptjs');
app.set("view engine", "ejs");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

// creating random string to be used for creating user id
function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
};


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
  
  
  // Add an endpoint to handle a POST to /login in your Express server
  app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const userFound = checkingUser(email, users);
  
  if (!userFound) {
    return res.status(403).send("email cannot be found");
  }
  // checking user's password
  if (!bcrypt.compareSync(password, userFound.password)) {
    return res.status(403).send("email and password not match")
  }
  req.session.user_id = userFound.id
  res.redirect(`/urls`)
});


// Add an endpoint to handle a POST to /logout, clears endpoint
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`)
});


app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  
  res.redirect(`/urls/${shortURL}`)
});


app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;

  res.redirect(`/urls/`)
});


// users' database
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
}

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
  
  req.session.user_id = newUserId;
  res.redirect(`/urls/`)
});


// creating new short URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  
  const userId = req.session.user_id
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL
  urlDatabase[shortURL].userID = userId
  
  res.redirect(`/urls/${shortURL}`)
});

// delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  delete urlDatabase[shortURL];
  res.redirect(`/urls/`);
});



// handling register layout
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  res.render("urls_registration", templateVars)
  .redirect(`/urls/`)
});


// handling login page
app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  res
  .render("urls_login", templateVars)
  .redirect(`/login/`)
});

// handling main display
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const urls = urlsForUser(id);
  const templateVars = {
    urls: urls,
    user: users[req.session.user_id],
  };

  if (!users[req.session.user_id]) {
    return res
      .status(403)
      .redirect(`/login/`)
  } 
  res.render("urls_index", templateVars)
});


// new url display
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };

  if (!users[req.session.user_id]) {
    return res
    .status(403)
    .redirect(`/login/`);
  } 

  res.render("urls_new", templateVars);
});


// edit display or going to long url display
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.body.user_id;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    url_userID: urlDatabase[shortURL].userID,
    user: users[req.session.user_id],
  };
  res
    .render("urls_show", templateVars)
    .redirect(`/urls/${ longURL }`)
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
      if (urlDatabase[key].userID === id) {
        output[key] = urlDatabase[key];
      }
    }
    return output;
}