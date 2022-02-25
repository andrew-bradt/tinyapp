// PACKAGE IMPORTS
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');

// CONSTANTS, DATABASES, CLASSES, HELPER FUNCTIONS
const {PORT} = require('./constants');
const {users, urlDatabase} = require('./databases');

const {Visit, URL} = require('./entities/entities');

const {getUserByEmail, generateRandomString, urlsForUser, doesUserOwnURL} = require('./helpers');
const isPasswordCorrect = (id, password) => {
  return (bcrypt.compareSync(password, users[id].password)) ? id : false;
};

// APP, MIDDLEWARE, TEMPLATE ENGINE
const app = express();

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieSession({
  name: 'session',
  keys: ['akjsdf', 'ahsdjkfhakjsdff', 'ahjsdkfhkasdf']
}));

app.set('view engine', 'ejs');

// ENDPOINTS

//    PATH:         /
app.get('/', (req, res)=>{
  if (req.session['user_id']) {
    return res.redirect('/urls');
  }
  res.redirect('/login');
});

//    PATH:          /urls
app.get('/urls', (req, res)=>{
  const userID = req.session['user_id'];
  const templateVars = {
    user: users[userID],
    urls: urlsForUser(userID, urlDatabase)
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res)=>{
  const userID = req.session['user_id'];
  if (!userID) {
    return res.status(403).send('You must be signed in to add a URL');
  }
  const {longURL} = req.body;
  const id = generateRandomString();
  const urlObj = new URL({userID, longURL});
  urlDatabase[id] = urlObj;
  res.redirect(`/urls/${id}`);
});


//    PATH:          /urls/new
app.get('/urls/new', (req, res)=>{
  if (!req.session['user_id']) {
    return res.redirect('/login');
  }
  const templateVars = {user: users[req.session['user_id']]};
  res.render('urls_new', templateVars);
});


//    PATH:          /urls/:id
app.get('/urls/:id', (req, res)=>{
  const {id} = req.params;
  const userID = req.session['user_id'];
  const ownedURLs = urlsForUser(userID, urlDatabase);
  if (!doesUserOwnURL(ownedURLs, id)) {
    return res.status(403).send('Resource does not exist or you are unauthorized.');
  }
  const templateVars = {
    user: users[userID],
    id,
    url: urlDatabase[id]
  };
  res.render('urls_show', templateVars);
});

app.put('/urls/:id', (req, res)=>{
  const userID = req.session['user_id'];
  const {id} = req.params;
  const {longURL} = req.body;
  const ownedURLs = urlsForUser(userID, urlDatabase);
  if (!doesUserOwnURL(ownedURLs, id)) {
    return res.status(403).send('Resource does not exist or you are unauthorized.');
  }
  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
});

app.delete('/urls/:id', (req, res)=>{
  const userID = req.session['user_id'];
  const {id} = req.params;
  const ownedURLs = urlsForUser(userID, urlDatabase);
  if (!doesUserOwnURL(ownedURLs, id)) {
    return res.status(403).send('Resource does not exist or you are unauthorized.');
  }
  delete urlDatabase[id];
  res.redirect('/urls');
});


//    PATH:          /u/:id
app.get('/u/:id', (req,res)=>{
  const {id} = req.params;
  const {longURL} = urlDatabase[id];
  if (!req.session.visitorID) {
    req.session.visitorID = `v_${generateRandomString()}`;
  }
  const visit = new Visit(req.session.visitorID);
  urlDatabase[id].addVisit(visit);
  res.redirect(longURL);
});


//    PATH:          /login
app.get('/login', (req, res)=>{
  if (req.session['user_id']) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session['user_id']],
    urls: urlDatabase
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res)=>{
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).send('You must provide an email and a password to login');
  }
  const userID = getUserByEmail(email, users);
  if (!userID || !isPasswordCorrect(userID, password)) {
    return res.status(403).send('Invalid email or password.');
  }
  req.session['user_id'] = userID;
  res.redirect('/urls');
});

//    PATH:          /logout
app.post('/logout', (req, res)=>{
  req.session = null;
  res.redirect('/urls');
});

//    PATH:          /register
app.get('/register', (req, res)=>{
  if (req.session['user_id']) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session['user_id']]
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res)=>{
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).send('You must provide an email and a password to register for an account.');
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send('An account has already been created with this email address.');
  }
  const userID = `u_${generateRandomString()}`;
  const user = {
    userID,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  users[userID] = user;
  req.session['user_id'] = userID;
  res.redirect('/urls');
});

// Listening
app.listen(PORT, ()=>{
  console.log(`Example app listening on port ${PORT}!`);
});
