var express = require('express');
var router = express.Router();
var { kv } = require('@vercel/kv');

router.get('/', function(req, res) {
  res.send({"version": "dev", "status": "dev"});
});

router.get('/get', async function(req, res) {
  res.send(await kv.lrange('chat', 0, -1));
});

router.post('/post', async function(req, res) {
  var lt = /</g, 
    gt = />/g, 
    ap = /'/g, 
    ic = /"/g;
  let message = req.body.message.toString().replace(lt, "&lt;").replace(gt, "&gt;").replace(ap, "&#39;").replace(ic, "&#34;");
  let data = {
    "time": new Date(),
    "message": message,
    "user": req.body.user
  }
  kv.lpush('chat', data)
  res.send({"status": "send-ok"});
});

router.put('/change', async function(req, res) {
  let data = await kv.lrange('chat', 0, -1);
  data.forEach((message, i) => {
    if (req.body.old.time === message.time && req.body.old.message === message.message && req.body.user === message.user) {
      message.message = req.body.new.message
      message.time = req.body.new.time
      kv.lset('chat', i, message)
    }
  });
  res.send({"status": "delete-ok"});
});

router.delete('/delete', async function(req, res) {
  let data = await kv.lrange('chat', 0, -1);
  data.forEach((message, i) => {
    if (req.body.time === message.time && req.body.message === message.message && req.body.user === message.user) {
      kv.lrem('chat', 1, message)
    }
  });
  res.send({"status": "delete-ok"});
});

module.exports = router;
