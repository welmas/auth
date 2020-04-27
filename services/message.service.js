//var dbconfig = require('dbconfig.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var dbconfig= require('dbconfig.json')
var config = require('config.json');

var db = mongo.db(dbconfig.connectionString, { native_parser: true });
db.bind('messages');

var db2 = mongo.db(config.connectionString, { native_parser: true });
db2.bind('users');

var db3 = mongo.db(config.connectionString, { native_parser: true });
db3.bind('topics');

var service = {};


service.getMessages = getMessages
service.getMessage = getMessage;
service.getChatHistory = getChatHistory;
service.getTopicSet = getTopicSet;

//service.delAndBlock = delAndBlock

module.exports = service;

   function getMessage(_id) {
      var deferred = Q.defer();
         db.messages.findById(_id, function (err, message) {
         if (err) deferred.reject(err.name + ': ' + err.message);
          if (message) {
              deferred.resolve(message);
            } else {
            deferred.resolve();
          }
        });
      return deferred.promise;
     }


    function getMessages(_id) {
       var deferred = Q.defer();
       db.messages.find( { $or: [{'n.u1' : _id}, {'n.u2' : _id }]})
                  .toArray(function (err, messages) {
            if (err) deferred.reject(err.name + ': ' + err.message);
               if (messages) {
                   deferred.resolve(messages);
                 } else {
                  deferred.resolve(function(){
                    console.log('none found')
                });
            }
        });
      return deferred.promise;
    }


    function getChatHistory(req) {
       var _id = req.sU_id;
       var r ={};
       var deferred = Q.defer();
       const query = { $or: [
         { $and: [{'n.sId' : req.cU_id}, {'n.rId' : req.sU_id }]},
         { $and: [{'n.sId' : req.sU_id}, {'n.rId' : req.cU_id }]},]}     
      if(req.u){
           db.messages.findOne(query, function (err, m) {
             if (err) deferred.reject(err.name + ': ' + err.message);
                if (m) {
                    r={m:m}
                  deferred.resolve(r);
              }else{
                 deferred.resolve();
              }
           });
                return deferred.promise;  
         }else if(req.m) {
            db2.users.findById(_id, function (err, u) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                    if (u) { 
                     r = {u:u}         
                     deferred.resolve(r);
                    }else{
                       deferred.resolve();
                    }
                 });
                 return deferred.promise;  
           }else{
             db2.users.findById(_id, function (err, user) {
               if (err) deferred.reject(err.name + ': ' + err.message);
                   if (user) {
                db.messages.findOne(query, function (err, message) {
                   if (err) deferred.reject(err.name + ': ' + err.message);
                   if (message) {
                       r= {u:user, m:message}
                        deferred.resolve(r);
                   } else {
                       r={u:user, m:null, err: true}
                        deferred.resolve(r);
                   }
               });
              }
            });
        return deferred.promise;
        }
    }
    
    
    function getTopicSet() {
        var deferred = Q.defer();
    
        db3.topics.find().toArray(function (err, topics) {
            if (err) deferred.reject(err.name + ': ' + err.message);

     
            deferred.resolve(topics);
        });
    
        return deferred.promise;
    }


/*

   function delAndBlock(_id) {
        
        var deferred = Q.defer();
        
            db.messages.remove(
                { _id: mongo.helper.toObjectID(_id) },
                function (err) {
                    if (err) deferred.reject(err.name + ': ' + err.message);
        
                    deferred.resolve();
                });
        
            return deferred.promise;

    }










function create(userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findOne(
        { username: userParam.username },
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {
                // username already exists
                deferred.reject('Username "' + userParam.username + '" is already taken');
            } else {
                createUser();
            }
        });

     function createUser() {
        // set user object to userParam without the cleartext password
        var user = _.omit(userParam, 'password');

        // add hashed password to user object
        user.hash = bcrypt.hashSync(userParam.password, 10);
        var r = shortid.generate();
        user.newsRoom = 'm' + r;
        user.faceRoom = 'i' + r;

        db.users.insert(
            user,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(_id, userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user.username !== userParam.username) {
            // username has changed so check if the new username is already taken
            db.users.findOne(
                { username: userParam.username },
                function (err, user) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (user) {
                        // username already exists
                        deferred.reject('Username "' + req.body.username + '" is already taken')
                    } else {
                        updateUser();
                    }
                });
        } else {
            updateUser();
        }
    });

    function updateUser() {
        // fields to update
        var set = {
            firstName: userParam.firstName,
            lastName: userParam.lastName,
            username: userParam.username,
        };

        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }

        db.users.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}


function authenticate(username, password) {
    var deferred = Q.defer();

    db.users.findOne({ username: username }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user && bcrypt.compareSync(password, user.hash)) {
            // authentication successful
            deferred.resolve({
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                faceRoom: user.faceRoom,
                newsRoom: user.newsRoom,
                token: jwt.sign({ sub: user._id }, config.secret)
            });
        } else {
            // authentication failed
            deferred.resolve();
        }
    });

    return deferred.promise;
}
*/