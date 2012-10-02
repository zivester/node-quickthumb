var express = require('express'),
    app = express(),
    qt = require('../');


app.configure(function(){
    app.use('/public', qt.static(__dirname + '/../public'));
});


app.get('/', function(req, res){
    var image = '/public/images/water.jpg';

    function img(q){
        return '<img src="' + image + q + '" title="' + image + q + '" />';
    }

    var h = '<center>';
    [ '200', '100x100', 'x60', '35', '10x10', 'x35', '60', '100x150', 'x200' ].forEach(function(dim){
        h += img('?dim=' + dim) + '&nbsp;';
    });
    h += '<br />' + img('?dim=800x100') + '<br />';
    h += '<br />' + img('') + '</center>';
    res.send(h);
});


app.listen(3000);
console.log("running on http://127.0.0.1:3000");
