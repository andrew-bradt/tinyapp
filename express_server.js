const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xk': 'http://www.google.com'
};

const users = {
  'user9aksmj': {
    id: 'user9aksmj',
    email: 'test@gmail.com',
    password: 'test'
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
  return (users[id].password === password) ? id : false;
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
  const templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res)=>{
  const {longURL} = req.body;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
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
  const templateVars = {
    user: users[req.cookies['user_id']],
    shortURL,
    longURL: urlDatabase[shortURL]
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res)=>{
  const {shortURL} = req.params;
  const {longURL} = req.body;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});



app.post('/urls/:shortURL/delete', (req, res)=>{
  const {shortURL} = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});



app.get('/u/:shortURL', (req,res)=>{
  const {shortURL} = req.params;
  const longURL = urlDatabase[shortURL];
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
    user: users[req.cookies['user_id']]
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res)=>{
  const {email, password} = req.body;
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
    password
  };
  users[id] = user;
  res.cookie('user_id', id);
  res.redirect('/urls');
});
// ~*~*~*~*~*~*~*~*~*~*~*~*

app.listen(PORT, ()=>{
  console.log(`Example app listening on port ${PORT}!`);
});