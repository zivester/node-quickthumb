var assert = require('assert'),
    express = require('express'),
    app = express(),
    fs = require('fs'),
    path = require('path'),
    qt = require('../lib/quickthumb');


app.configure(function(){
    app.use('/public', qt.express(__dirname + '/../public'));
});


app.get('/', function(req, res){
    var h = '';
    [ 200, 100, 60, 35, 10, 35, 60, 100, 200 ].forEach(function(width){
        h += '<img src="/public/images/red.gif?dim=' + width + '" />';
    });
    h += '<br /><img src="/public/images/red.gif" />';
    res.send(h);
});


app.listen(3000);
console.log("running");
