var cookieSession = require('cookie-session')
const { getUserByEmail } = require("./helper");


const express = require("express");
const app = express();
app.use(cookieSession({
  name: 'session',
  secret: "1"
}));

const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));



const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  }
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  const templateVars = {};
  const id = req.session["user_id"]
  //if user_id is not present then throw error
  if (users[id]) {
    templateVars.user = users[id];
    templateVars.urls = urlsForUser(id)
    res.render("urls_index", templateVars)
  }
  else {
    return res.send("user is not logged in", 403)
  }
});

//id refers to the current user's id
function urlsForUser(id) {
  var urlDatabaseKeys = Object.keys(urlDatabase)
  var urls = {}

  for (Key of urlDatabaseKeys) {
    if (id === urlDatabase[Key].userID) {
      urls[Key] = urlDatabase[Key]
    }
  }
  return urls
}

app.get("/urls/new", (req, res) => {
  const templateVars = {};
  templateVars.user = users[req.session["user_id"]];
  if (req.session["user_id"] === undefined) {
    res.redirect("/urls");
  } else {
    res.render("urls_new", templateVars)
  }
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars)
  }
});


app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars)
  }
});


app.get("/urls/:id", (req, res) => {

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL };
  res.render("urls_show", templateVars);
});





app.post("/urls", (req, res) => {
  if (req.session["user_id"] === undefined) {
    res.send("Not logged in");
  } else {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL
    let userID = req.session.user_id

    urlDatabase[shortURL] = { longURL: longURL, userID: userID }
    res.redirect('/urls')
  }
});

function generateRandomString() {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


app.get("/u/:id", (req, res) => {
  const url = urlDatabase[req.params.id]
  console.log(url)
  if (url === undefined) {
    res.send("Not exist");
  } else {
    res.redirect(url.longURL)
  };
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]


  res.redirect("/urls");
});

app.post("/urls/register", (req, res) => {
  const bcrypt = require("bcryptjs");
  const id = generateRandomString()
  const password = req.body.password; // found in the req.body object
  const hashedPassword = bcrypt.hashSync(password, 10);

  for (var userID in users) {
    if (req.body.email === users[userID].email) {
      res.send("400")
    }
  }
  if (req.body.email === "" || req.body.password === "") {
    res.send("400")
  } else {
    users[id] = { id: id, email: req.body.email, password: hashedPassword }
    req.session.user_id = id
    res.redirect("/urls");
  }
});



app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  let user = getUserByEmail(email, users)
  if (user === undefined) {
    res.status(403).send("user does not exist")
  }
  else {
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(403).send("password is incorrect")
    }
    else {
      req.session.user_id = user.id
      res.redirect("/urls");
    }
  }
});


app.post("/logout", (req, res) => {
  res.clearCookie("session")
  res.redirect("/login");
});

