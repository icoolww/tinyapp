const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var cookieParser = require('cookie-parser')

app.use(cookieParser())


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


function generateRandomString() {
    return Math.random().toString(36).slice(2, 8);
};


// Add an endpoint to handle a POST to /login in your Express server
app.post("/login", (req, res) => {
  const username = req.body.username;
  // urlDatabase[shortURL] = req.body.longURL; 
  res
    .cookie("username", username)
    .redirect(`/urls`)
});


// Add an endpoint to handle a POST to /logout, clears endpoint
app.post("/logout", (req, res) => {
  const username = req.body.username;
  // urlDatabase[shortURL] = req.body.longURL; 
  res
    .clearCookie("username", username)
    .redirect(`/urls`)
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  // urlDatabase[shortURL] = req.body.longURL; 
  res.redirect(`/urls/${shortURL}`)
});



app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  // console.log(req.body); 
  // console.log(urlDatabase);
  res.redirect(`/urls/`)
});



app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

// creating new short URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");            // Respond with 'Ok' (we will replace this)
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
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    username: req.cookies["username"],
  };
  // console.log(templateVars);
  res.render("urls_show", templateVars);
  // res.redirect(`/urls/${  }`)
  
});


// redirect short URL to its long URL
app.get("/u/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL];

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