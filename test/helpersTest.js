const {assert} = require('chai');

const {getUserByEmail, generateRandomString} = require('../helpers');

const testUsers = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  "user2RandomID": {
    id: 'user2RandomID',
    email: 'user2@exmaple.com',
    password: 'dishwasher-funk'
  }
};

describe('getUserByEmail', ()=>{
  it('should return a user with valid email', ()=>{
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUserId = 'userRandomID';
    assert.strictEqual(user, expectedUserId);
  });
  it('Should return undefined if providing an invalid email', ()=>{
    const user = getUserByEmail('nonexistant@gmail.com', testUsers);
    assert.isUndefined(user);
  });
});

describe('generateRandomString', ()=>{
  it('Should return a string', ()=>{
    const result = generateRandomString();
    assert.isString(result);
  });
  it('Should have a length of 6', ()=>{
    const result = generateRandomString().length;
    assert.strictEqual(result, 6);
  });
});