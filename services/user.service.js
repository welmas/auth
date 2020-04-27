var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');


var db = mongo.db(config.connectionString, { native_parser: true });
db.bind("users");

var service = {};

service.authenticate = authenticate;
service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;
service.finalize = finalize;
service.addFbToken = addFbToken;
service.removeFbToken = removeFbToken;
service.getFbToken = getFbToken;
//service.removeEntry = removeEntry;

module.exports = service;

function authenticate(username, password) {
    var deferred = Q.defer();

    db.users.findOne({ username: username }, function (err, user) {

        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user && bcrypt.compareSync(password, user.hash)) {
               
                // authentication successful
                var currentUser ={};
                currentUser = {
                _id:user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                country : user.country,
                cityLived : user.cityLived,     
                cityCameFrom : user.cityCameFrom,
                education : user.education,
                profession : user.profession,
                gender: user.gender,
                age: user.age,
                commonChannel: user.commonChannel,
                phone: user.phone,
                profilePic: user.profilePic,
                fbTokens: user.fbTokens,
                online : user.online,
                followers: user.followers,
                following : user.following,
                token: jwt.sign({ sub: currentUser._id }, config.secret) 
                }
     
                  deferred.resolve( currentUser);    

                 } else {
            // authentication failed
                      deferred.resolve();
        }
    });

               return deferred.promise;
}


function getAll() {
    var deferred = Q.defer();

    db.users.find().toArray(function (err, users) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        // return users (without hashed passwords)
        users = _.map(users, function (user) {
            return _.omit(user, 'hash');
        });

        deferred.resolve(users);
    });

    return deferred.promise;
}


function getById(_id) {
    var deferred = Q.defer();

    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}


function getFbToken(_id) {
    var deferred = Q.defer();

    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            // return user (without hashed password)
            deferred.resolve({fbTokens:user.fbTokens});
        } else {
            // user not found
            deferred.resolve();
        }
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
        var doc = _.omit(userParam, 'password');

        // add hashed password to user object
        doc.hash = bcrypt.hashSync(userParam.password, 10);
        doc.followers = [];
        doc.following = [];
        doc.fbTokens = [];
        doc.socketGroup = [];

            db.users.insert(doc, function (err, res) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                     
                if(res.insertedCount === 1) {
                   var user = res.ops[0];
                 //  console.log(res)
                     deferred.resolve({_id: user._id});    
                }else{
                    deferred.resolve();
                }
            });
    }

    return deferred.promise;
}



function finalize(appendData) {
    var deferred = Q.defer();

 console.log(appendData);

       var set = {};


                  set = { 
                    firstName : appendData.firstName, 
                    lastName : appendData.lastName,
                    cityLived : appendData.cityLived,     
                    gender: appendData.gender,
                    age: appendData.age,
                    commonChannel: appendData.commonChannel,
                    phone: appendData.phone,
                    online: appendData.online,
                    education: appendData.education,
                    profession: appendData.profession,
                    profilePic: appendData.profilePic
                  
                  };

      db.users.findOneAndUpdate({ _id: mongo.helper.toObjectID(appendData._id) },
                                { $set: set }, {returnOriginal: false},
            function (err, doc) {
               // console.log('err' + err);
               // console.log(doc);
           //   if (err) deferred.reject(err.name + ': ' + err.message);
              if(doc.value === null || doc.lastErrorObject.n === 0 ) { 
                  
               deferred.reject("Opss, Someting went wrong");
           
           } else {
           //  deferred.resolve(_.omit(doc.value, 'hash'));
       
          var _obj = doc.value
           var res = {
               _id:_obj._id,
               username: _obj.username,
               firstName: _obj.firstName,
               lastName: _obj.lastName,
               country : _obj.country,
               cityLived : _obj.cityLived,     
               cityCameFrom : _obj.cityCameFrom,
               age: _obj.age,
               commonChannel: _obj.commonChannel,
               phone: _obj.phone,
               education : _obj.education,
               profession : _obj.profession,
               gender: _obj.gender,
               profilePic: _obj.profilePic,
               online : _obj.online,
               fbTokens:_obj.fbTokens,
               token: jwt.sign({ sub: _obj._id }, config.secret) 
           }
             deferred.resolve(res);

           }
                     
            });

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

        db.users.findOneAndUpdate(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}



function addFbToken(req){
    var deferred = Q.defer();
   console.log(req)
 

     db.users.findOneAndUpdate({ _id: mongo.helper.toObjectID(req._id) },
                  { $push: {'fbTokens': req.token }},
                  { returnOriginal: false },
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
           var tokens = {fbTokens:doc.value.fbTokens}
            deferred.resolve(tokens);
        });

    return deferred.promise;
  

}



function removeFbToken(req){
    var deferred = Q.defer();
   console.log(req)
 

     db.users.update({ _id: mongo.helper.toObjectID(req._id) },{ $pull: {'fbTokens': req.token }},

        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
         console.log(doc)

            deferred.resolve();
        });

    return deferred.promise;
  

}



function _delete(_id) {
    var deferred = Q.defer();

    db.users.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}
