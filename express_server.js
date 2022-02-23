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
 
};

const generateRandomString = () => Math.random().toString(36).slice(2, 8);

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
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render('urls_new', templateVars);
});



app.get('/urls/:shortURL', (req, res)=>{
  const {shortURL} = req.params;
  const user = users[req.cookies[user.id]];
  const templateVars = {
    user,
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

app.post('/login', (req, res)=>{
  // const {username} = req.body;
  // res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res)=>{
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res)=>{
  const templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res)=>{
  const {email, password} = req.body;
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
// app.use('*', (req, res) => res.status(404).send('The page you have requested does not exist.'));
// ~*~*~*~*~*~*~*~*~*~*~*~*

app.listen(PORT, ()=>{
  console.log(`Example app listening on port ${PORT}!`);
});