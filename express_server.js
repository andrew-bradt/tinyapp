const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;
const {getUserByEmail, generateRandomString, urlsForUser, doesUserOwnURL} = require('./helpers');


const isPasswordCorrect = (id, password) => {
  return (bcrypt.compareSync(password, users[id].password)) ? id : false;
};


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

// ~*~*~*~*~*~* MIDDLEWARE ~*~*~*~*~*~*
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));
app.set('view engine', 'ejs');

// ~*~*~*~*~*~* ENDPOINTS ~*~*~*~*~*~*
app.get('/', (req, res)=>{
  res.send('Hello!');
});


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
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${shortURL}`);
});



app.get('/urls/new', (req, res)=>{
  if (!req.session['user_id']) {
    return res.redirect('/login');
  }
  const templateVars = {user: users[req.session['user_id']]};
  res.render('urls_new', templateVars);
});



app.get('/urls/:shortURL', (req, res)=>{
  const {shortURL} = req.params;
  const userID = req.session['user_id'];
  const ownedURLs = urlsForUser(userID, urlDatabase);
  if (!doesUserOwnURL(ownedURLs, shortURL)) {
    return res.status(403).send('Resource does not exist or you are unauthorized.');
  }
  const templateVars = {
    user: users[userID],
    shortURL,
    longURL: urlDatabase[shortURL].longURL
  };
  res.render('urls_show', templateVars);
});

app.put('/urls/:shortURL', (req, res)=>{
  const userID = req.session['user_id'];
  const {shortURL} = req.params;
  const {longURL} = req.body;
  const ownedURLs = urlsForUser(userID, urlDatabase);
  if (!doesUserOwnURL(ownedURLs, shortURL)) {
    return res.status(403).send('Resource does not exist or you are unauthorized.');
  }
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

app.delete('/urls/:shortURL', (req, res)=>{
  const userID = req.session['user_id'];
  const {shortURL} = req.params;
  const ownedURLs = urlsForUser(userID, urlDatabase);
  if (!doesUserOwnURL(ownedURLs, shortURL)) {
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

app.post('/logout', (req, res)=>{
  req.session = null;
  res.redirect('/urls');
});

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
  const userID = `user${generateRandomString()}`;
  const user = {
    userID,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  users[userID] = user;
  req.session['user_id'] =  userID;
  res.redirect('/urls');
});
// ~*~*~*~*~*~*~*~*~*~*~*~*

app.listen(PORT, ()=>{
  console.log(`Example app listening on port ${PORT}!`);
});
