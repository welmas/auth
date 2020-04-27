var notdbconfig = require('notdbconfig.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
//var dbconfig= require('dbconfig.json')
//var config = require('config.json');


var db = mongo.db(notdbconfig.connectionString, { native_parser: true });
db.bind('notifications');

var service = {};


service.getNotifications = getNotifications;
service.insertImage = insertImage;
//service.getMessage = getMessage;
//service.getChatHistory = getChatHistory;

//service.delAndBlock = delAndBlock

module.exports = service;

function insertImage(doc) {
  var deferred = Q.defer();
  db.notifications.insert(doc, function (err, res) {
             
       if (err) deferred.reject(err.name + ': ' + err.message);
          if (doc) {
              deferred.resolve(doc);
            } else {
             deferred.resolve(function(){
               console.log('none found')
           });
       }
   });
 return deferred.promise;
}

function getNotifications(_id) {
    var deferred = Q.defer();
    db.notifications.find( { "res.uId" : _id })
               .toArray(function (err, notes) {
         if (err) deferred.reject(err.name + ': ' + err.message);
            if (notes) {
                deferred.resolve(notes);
              } else {
               deferred.resolve(function(){
                 console.log('none found')
             });
         }
     });
   return deferred.promise;
 }