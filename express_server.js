const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xk': 'http://www.google.com'
};

const generateRandomString = (num) => {
  const minVal = 35 ** 5;
  const randVal = Math.floor(Math.random() * minVal) + minVal;
  return randVal.toString(35);
};

app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine', 'ejs');

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
  res.send('OK');
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

app.get('/urls.json', (req, res)=>{
  res.json(urlDatabase);
});

app.get('/hello', (req, res)=>{
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, ()=>{
  console.log(`Example app listening on port ${PORT}!`);
});