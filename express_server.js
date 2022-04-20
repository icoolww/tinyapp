const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


function generateRandomString() {
    return Math.random().toString(36).slice(2, 8);
};



app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  // urlDatabase[shortURL] = req.body.longURL; 
  res.redirect(`/urls/${shortURL}`)
});



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// console.log(urlDatabase);

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; // save the random string and the long URL to the database

  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");            // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`)
});

app.post("/urls/:shortURL/delete", (req, res) => {

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls/`);
});



app.get("/urls/new", (req, res) => {

  res.render("urls_new");
});


app.get("/urls/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  const templateVars = {
    shortURL: shortURL,
    longURL: longURL
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