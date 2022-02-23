const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.google.ca",
    userID: "user3t402k"
  },
  abcdef: {
    longURL: "https://www.google.ca",
    userID: "user999999"
  }
};

const users = {
  user3t402k: {
    id: 'user3t402k',
    email: 'test@gmail.com',
    password: bcrypt.hashSync('test', 10)
  },
  user999999: {
    id: 'user999999',
    email: 'a@a.com',
    password: bcrypt.hashSync('test', 10)
  }
};

const generateRandomString = () => Math.random().toString(36).slice(2, 8);

const isEmailRegistered = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return false;
};

const isPasswordCorrect = (id, password) => {
  return (bcrypt.compareSync(password, users[id].password)) ? id : false;
};

const urlsForUser = (id) => {
  const urls = {};
  for (const shortURL in urlDatabase) {
    const {userID, longURL} = urlDatabase[shortURL];
    if (userID === id) {
      urls[shortURL] = longURL;
    }
  }
  return urls;
};

const doesUserOwnURL = (id, shortURL) => {
  const usersURLs = urlsForUser(id);
  return usersURLs[shortURL] !== undefined;
};

// ~*~*~*~*~*~* MIDDLEWARE ~*~*~*~*~*~*
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

// ~*~*~*~*~*~* ENDPOINTS ~*~*~*~*~*~*
app.get('/', (req, res)=>{
  res.send('Hello!');
});


app.get('/urls', (req, res)=>{
  const {'user_id':userID} = req.cookies;
  const templateVars = {
    user: users[userID],
    urls: urlsForUser(userID, urlDatabase)
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res)=>{
  const userID = req.cookies['user_id'];
  if (!userID) {
    return res.status(403).send('You must be signed in to add a URL');
  }
  const {longURL} = req.body;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${shortURL}`);
});



app.get('/urls/new', (req, res)=>{
  if (!req.cookies['user_id']) {
    return res.redirect('/login');
  }
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render('urls_new', templateVars);
});



app.get('/urls/:shortURL', (req, res)=>{
  const {shortURL} = req.params;
  const id = req.cookies['user_id'];
  if (!doesUserOwnURL(id, shortURL)) {
    return res.status(403).send('Resource does not exist or you are unauthorized.');
  }
  const templateVars = {
    user: users[id],
    shortURL,
    longURL: urlDatabase[shortURL].longURL
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res)=>{
  const id = req.cookies['user_id'];
  const {shortURL} = req.params;
  const {longURL} = req.body;
  if (!doesUserOwnURL(id, shortURL)) {
    return res.status(403).send('Resource does not exist or you are unauthorized.');
  }
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});



app.post('/urls/:shortURL/delete', (req, res)=>{
  const id = req.cookies['user_id'];
  const {shortURL} = req.params;
  if (!doesUserOwnURL(id, shortURL)) {
    return res.status(403).send('Resource does not exist or you are unauthorized.');
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});



app.get('/u/:shortURL', (req,res)=>{
  const {shortURL} = req.params;
  const {longURL} = urlDatabase[shortURL];
  res.redirect(longURL);
});



app.get('/urls.json', (req, res)=>{
  res.json(urlDatabase);
});

app.get('/login', (req, res)=>{
  if (req.cookies['user_id']) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res)=>{
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).send('You must provide an email and a password to login');
  }
  const id = isEmailRegistered(email);
  if (!id || !isPasswordCorrect(id, password)) {
    return res.status(403).send('Invalid email or password.');
  }
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post('/logout', (req, res)=>{
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res)=>{
  if (req.cookies['user_id']) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res)=>{
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).send('You must provide an email and a password to register for an account.');
  }
  if (isEmailRegistered(email)) {
    return res.status(400).send('An account has already been created with this email address.');
  }
  const id = `user${generateRandomString()}`;
  const user = {
    id,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  users[id] = user;
  res.cookie('user_id', id);
  res.redirect('/urls');
});
// ~*~*~*~*~*~*~*~*~*~*~*~*

app.listen(PORT, ()=>{
  console.log(`Example app listening on port ${PORT}!`);
});