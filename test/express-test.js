var express = require('express'),
    app = express(),
    qt = require('../');


app.configure(function(){
    app.use('/public', qt.static(__dirname + '/../public'));
});


app.get('/', function(req, res){
    var h = '<center>';
    [ 200, 100, 60, 35, 10, 35, 60, 100, 200 ].forEach(function(width){
        var src = '/public/images/red.gif?dim=' + width;
        h += '<img src="' + src + '" title="' + src + '" />&nbsp;';
    });
    h += '<br /><img src="/public/images/red.gif" title="/public/images/red.gif" /></center>';
    res.send(h);
});


app.listen(3000);
console.log("running on http://127.0.0.1:3000");
