var express = require('express');
var router = express.Router();
var { sha256 } = require("js-sha256")
var bcrypt = require('bcryptjs');
var { kv } = require('@vercel/kv');

router.get('/', function(req, res) {
  res.send({"version": "dev-user", "status": "dev"});
});

router.post('/login', async function(req, res) {
  let data = await kv.lrange('users', 0, -1)
  data.forEach(user => {
    if(req.body.username === user.username && bcrypt.compareSync(sha256(req.body.password), user.password)) {
      res.send({"passed": true})
    } else {
      res.send({"passed": false})
    }
  });
});

router.post('/register', async function(req, res) {
  let data = await kv.lrange('users', 0, -1)
  if (!data.find((user) => {
    return user.username === req.body.username
  })) {
    kv.lpush('users', {
      "username": req.body.username,
      "password": bcrypt.hashSync(sha256(req.body.password), bcrypt.genSaltSync(10))
    })
    res.send({"register": "ok"})
  } else res.send({"register": "duplicate"})
});

router.put('/change', async function(req, res) {
  let data = await kv.lrange('users', 0, -1)
  data.forEach((user, i) => {
    if (user.username === req.body.old.username && bcrypt.compareSync(sha256(req.body.old.password), user.password)) {
      user.username = req.body.new.username
      user.password = bcrypt.hashSync(sha256(req.body.new.password), bcrypt.genSaltSync(10))
      kv.lset('users', i, user)
    }
  });
  res.send({"change": "ok"})
});

router.delete('/delete', async function(req, res) {
  let data = await kv.lrange('users', 0, -1)
  data.forEach((user, i) => {
    if (user.username === req.body.username && bcrypt.compareSync(sha256(req.body.password), user.password)) {
      kv.lrem('users', 1, user)
    }
  });
  res.send({"delete": "ok"})
});

module.exports = router;
