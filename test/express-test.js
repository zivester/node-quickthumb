var assert = require('assert'),
    express = require('express'),
    app = express(),
    fs = require('fs'),
    path = require('path'),
    qt = require('../lib/quickthumb');


app.configure(function(){
    app.use(qt.express('/public', __dirname + '/../public'));
});


app.get('/', function(req, res){
    var h = '';
    [ 200, 100, 50, 25, 10, 25, 50, 100, 200 ].forEach(function(width){
        h += '<img src="/public/images/red.gif?dim=' + width + '" />';
    });
    res.send(h);
});


app.listen(3000);
console.log("running");
