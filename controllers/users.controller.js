﻿var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');
var messageService =require('services/message.service');
// routes
router.post('/authenticate', authenticate);
router.post('/finalize', finalize);
router.post('/register', register);
router.post('/addtoken', addFbToken);
router.post('/removetoken', removeFbToken);
router.post('/gettoken', getFbToken)
router.get('/', getAll);
router.get('/current', getCurrent);
router.put('/:_id', update);
router.delete('/:_id', _delete);


module.exports = router;

function authenticate(req, res) {
 
    userService.authenticate(req.body.username, req.body.password)
        .then(function (user) {
            if (user) {
          res.send(user);
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
   
    userService.create(req.body)
        .then(function (user) {
            res.send(user);
           
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function finalize(req,res) {
    userService.finalize(req.body)
        .then(function (response) {
          
            res.send(response);
        })
        .catch(function (err) {
            res.status(400).send('err');
        });
}


function addFbToken(req, res) {

    userService.addFbToken(req.body)
        .then(function (tokens) {
            res.send(tokens);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
        
}


function removeFbToken(req, res) {

    userService.removeFbToken(req.body)
        .then(function () {
            res.send({ res: "OK" });
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
        
}



function getFbToken(req, res) {
   
    userService.getFbToken(req.body.userId)
        .then(function (fbToken) {
            res.send(fbToken);
           
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}















function _delete(req,res) {
       Service._delete(req.body._id)
        .then(function () {
           res.send()
         
        })   
        .catch(function (err) {
            res.status(400).send('err');
        });
}

function getAll(req, res) {
    userService.getAll()
        .then(function (users) {
            res.send(users);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrent(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function update(req, res) {
    userService.update(req.params._id, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function _delete(req, res) {
    userService.delete(req.params._id)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

