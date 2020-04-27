var config = require('dbconfig.json');
var express = require('express');
var router = express.Router();
var messageService = require('services/message.service');


router.post('/', getMessages);
router.post('/message', getMessage);
router.post('/chathistory', getChatHistory);
router.get('/topicset', getTopicSet);



module.exports = router;

var counter = 1

function getTopicSet(req, res) {
   
    messageService.getTopicSet()
        .then(function (topics) {
       console.log("http counter for topics: --->   "+counter)
            res.send(topics);
            counter++
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}






function getMessages(req, res) {
    messageService.getMessages(req.body._id)
        .then(function (messages) {
             res.send(messages);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
       
}

function getMessage(req, res) {
   messageService.getMessage(req.body._id)
      .then(function (message) {
          if (message) {
              res.send(message);
                } else {
            res.status(400).send('message not found');
            }
        })
        .catch(function (err) {
     res.status(400).send(err);
        });
       
}


function getChatHistory(req, res) {
        messageService.getChatHistory(req.body)
          .then(function (r) {
              if (r) {
                 res.send(r);
              console.log('controler -->')
              console.log(r)
                } else {
               var resp = { 'err': true }  
              res.send(resp);
                }
            })
            .catch(function (err) {
        res.status(404).send();
            });
         
}

/*

function delAndBlock(req, res){

    messageService.delAndBlock(req.body._id)
    .then(function () {
        res.sendStatus(200);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}


function update(req, res) {
    messageService.update(req.params._id, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function authenticate(req, res) {
    messageService.authenticate(req.body.username, req.body.password)
        .then(function (user) {
            if (user) {
                // authentication successful
                res.send(user);
                console.log(user)
            } else {
                // authentication failed
                res.status(400).send('Username or password is incorrect');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function register(req, res) {
    messageService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

*/
