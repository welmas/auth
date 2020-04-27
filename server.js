var path = require('rootpath')();
var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
var dbconfig = require('dbconfig.json');

const fs = require('fs');
const http = require('http');
const https = require('https');


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/melmas.dynu.net/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/melmas.dynu.net/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/melmas.dynu.net/chain.pem', 'utf8');




// use JWT auth to secure the api, the token can be passed in the authorization header or querystring
app.use(expressJwt({
    secret: config.secret,
    getToken: function (req) {
      //  console.log(req)

        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
          } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }
  }).unless({ path: ['/users/authenticate', '/users/register', '/users/finalize', '/images/insert'] }));

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

// routes
app.use('/users', require('./controllers/users.controller'));
app.use('/messages', require('./controllers/messages.controller'));
app.use('/images', require('./controllers/notifications.controller'));
// start server
var port = process.env.NODE_ENV === 'production' ? 80 : 4000;
var server  = https.createServer(credentials, app);

server.listen(port, () => {
    console.log("Https Auth server starting on port : " + port)
  });