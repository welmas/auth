var config = require('notdbconfig.json');
var express = require('express');
var router = express.Router();
var notificationService = require('services/notification.service');


router.post('/', getNotifications);
router.post('/insert', insertImage);


module.exports = router;

function insertImage(req, res) {
    notificationService.insert(req.body)
        .then(function (image) {
             res.send(image);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
       
}

function getNotifications(req, res) {
    notificationService.getNotifications(req.body._id)
        .then(function (note) {
             res.send(note);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
       
}