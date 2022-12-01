const cookieParser = require('cookie-parser')

const express = require("express");
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  console.log(req.cookies)
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
  const templateVars = { urls: urlDatabase };
  const id=req.cookies["user_id"]
  templateVars.user = users[id];
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {};
  templateVars.user = users[req.cookies["user_id"]];
  res.render("urls_new", templateVars);
});

app.get("/urls/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

app.get("/urls/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});




app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
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
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/register",(req,res)=>{
  const id=generateRandomString()

  for(var userID in users){
     if(req.body.email===users[userID].email){
      res.send("400")
     }
  }
  if(req.body.email==="" || req.body.password==="" ){
    res.send("400")
  } else {
    users[id]={id: id, email: req.body.email, password:req.body.password}
    res.cookie("user_id",id)
    res.redirect("/urls");
  }
  

});


app.post("/urls/:id",(req,res)=>{
console.log(req.body)
res.redirect("/urls");
});

app.post("/login",(req,res)=>{
  const email=req.body.email
  var user_id
  for(var userID in users){
    if(users[userID].email===email){
      user_id=users[userID].id
    }
  }
  console.log(users)
  res.cookie("user_id",user_id)
  res.redirect("/urls");
});

app.post("/logout",(req,res)=>{
  res.clearCookie('user_id')
  res.redirect("/urls");
});
