var express = require('express');
var router = express.Router();
var fs = require("fs")

router.get('/', function(req, res) {
  res.send({"version": "dev", "status": "dev"});
});

router.get('/get', function(req, res) {
  res.send(JSON.parse(fs.readFileSync("./data/chat.json", "utf-8")));
});

router.post('/post', function(req, res) {
  let data = JSON.parse(fs.readFileSync("./data/chat.json", "utf-8"));
  var lt = /</g, 
    gt = />/g, 
    ap = /'/g, 
    ic = /"/g;
  let message = req.body.message.toString().replace(lt, "&lt;").replace(gt, "&gt;").replace(ap, "&#39;").replace(ic, "&#34;");
  data = [{
    "time": new Date(),
    "message": message,
    "user": req.body.user
  }].concat(data);
  fs.writeFileSync("./data/chat.json", JSON.stringify(data));
  res.send({"status": "send-ok"});
});

router.put('/change', function(req, res) {
  let data = JSON.parse(fs.readFileSync("./data/chat.json", "utf-8"));
  data.forEach((message, i) => {
    if (req.body.old.time === message.time && req.body.old.message === message.message && req.body.user === message.user) {
      message.message = req.body.new.message
      message.time = req.body.new.time
    }
  });
  fs.writeFileSync("./data/chat.json", JSON.stringify(data));
  res.send({"status": "delete-ok"});
});

router.delete('/delete', function(req, res) {
  let data = JSON.parse(fs.readFileSync("./data/chat.json", "utf-8"));
  data.forEach((message, i) => {
    if (req.body.time === message.time && req.body.message === message.message && req.body.user === message.user) {
      data = data.slice(0, i).concat(data.slice(i + 1));
    }
  });
  fs.writeFileSync("./data/chat.json", JSON.stringify(data));
  res.send({"status": "delete-ok"});
});

module.exports = router;
