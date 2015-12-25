"use strict";

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    webPush = require('web-push'),
    http = require('http'),
    server = http.createServer(app);

//app.use(function (req, res, next) {
//var matchJavascript = req.url.match(/.*\.js$/);

//console.log('req.url: ', req.url);
//if (matchJavascript) {
//    console.log('setting javascript header for ', matchJavascript[0]);
//    res.setHeader("content-type", "application/javascript");
//}
//next();
//});

app.set('port', 8000);
app.set('etag', false);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

app.post('/subscribe', function (req, res) {
    var subscription,
        endpoint,
        name;

    if (req.body) {
        subscription = {
            endpoint: req.body.replace('https://android.googleapis.com/gcm/send/'),
            name: req.body.name
        };
    }
    fs.appendFile('subscribers.txt', JSON.stringify(subscription), function (err, data) {
        if (err) {
            res.statusCode(500);
        } else {
            res.send('ok');
        }
    });

});

app.post('/unsubscribe', function (req, res) {
    console.log(req.body);
    //fs.appendFile('subscribers.txt', req.body, function (err, data) {
    //
    //});
    res.send('ok');
});

app.use('/', express.static('.'));


server.listen(app.get('port'));

console.log('HTTP Server is started and listening ' + app.get('port'));