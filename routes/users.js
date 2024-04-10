var express = require('express');
var router = express.Router();
var fs = require("fs")
var { sha256 } = require("js-sha256")
var bcrypt = require('bcryptjs');
var { join } = require("path")

let file = join(process.cwd(), "./data/users")

router.get('/', function(req, res) {
  res.send({"version": "dev-user", "status": "dev"});
});

router.post('/login', function(req, res) {
  let data = JSON.parse(Buffer.from(fs.readFileSync(file).toString(), 'base64').toString('utf8'));
  data.forEach(user => {
    if(req.body.username === user.username && bcrypt.compareSync(sha256(req.body.password), user.password)) {
      res.send({"passed": true})
    } else {
      res.send({"passed": false})
    }
  });
});

router.post('/register', function(req, res) {
  let data = JSON.parse(Buffer.from(fs.readFileSync(file).toString(), 'base64').toString('utf8'));
  if (!data.find((user) => {
    return user.username === req.body.username
  })) {
    data.push({
      "username": req.body.username,
      "password": bcrypt.hashSync(sha256(req.body.password), bcrypt.genSaltSync(10))
    })
    fs.writeFileSync(file, Buffer.from(JSON.stringify(data), "utf8").toString('base64'));
    res.send({"register": "ok"})
  } else res.send({"register": "duplicate"})
});

router.put('/change', function(req, res) {
  let data = JSON.parse(Buffer.from(fs.readFileSync(file).toString(), 'base64').toString('utf8'));
  data.forEach((user, i) => {
    if (user.username === req.body.old.username && bcrypt.compareSync(sha256(req.body.old.password), user.password)) {
      user.username = req.body.new.username
      user.password = bcrypt.hashSync(sha256(req.body.new.password), bcrypt.genSaltSync(10))
    }
  });
  fs.writeFileSync(file, Buffer.from(JSON.stringify(data), "utf8").toString('base64'));
  res.send({"change": "ok"})
});

router.delete('/delete', function(req, res) {
  let data = JSON.parse(Buffer.from(fs.readFileSync(file).toString(), 'base64').toString('utf8'));
  data.forEach((user, i) => {
    if (user.username === req.body.username && bcrypt.compareSync(sha256(req.body.password), user.password)) {
      data = data.slice(0, i).concat(data.slice(i + 1));
    }
  });
  fs.writeFileSync(file, Buffer.from(JSON.stringify(data), "utf8").toString('base64'));
  res.send({"delete": "ok"})
});

module.exports = router;
