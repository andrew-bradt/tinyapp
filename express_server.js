const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xk': 'http://www.google.com'
};

const generateRandomString = () => Math.random().toString(36).slice(2, 8);

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');

// ~*~*~*~*~*~* ENDPOINTS ~*~*~*~*~*~*
app.get('/', (req, res)=>{
  res.send('Hello!');
});


app.get('/urls', (req, res)=>{
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res)=>{
  const {longURL} = req.body;
  console.log(longURL);
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});



app.get('/urls/new', (req, res)=>{
  res.render('urls_new');
});



app.get('/urls/:shortURL', (req, res)=>{
  const {shortURL} = req.params;
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL]
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res)=>{
  const {shortURL} = req.params;
  const {longURL} = req.body;
  console.log('shortURL', shortURL);
  console.log('longURL', longURL);
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

// ~*~*~*~*~*~*~*~*~*~*~*~*

app.listen(PORT, ()=>{
  console.log(`Example app listening on port ${PORT}!`);
});