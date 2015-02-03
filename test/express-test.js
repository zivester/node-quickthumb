var express = require('express'),
    app = express(),
    qt = require('../'),
    filename = 'cape cod.jpg';


// Crop
app.use('/public/crop', qt.static(__dirname + '/../public', {
    cacheDir : '/tmp/cache',
    quality : .95
}));
// Resize
app.use('/public/resize', qt.static(__dirname + '/../public', {
    type : 'resize',
}));


app.get('/', function(req, res){
    var types = [ 'crop', 'resize' ];

    function img(type,q){
        var src = '/public/' + ( type ? type + '/' : '' ) + 'images/' + filename + q;
        return '<img src="' + src + '" title="' + src + '" />';
    }

    var h = '<center>';
    types.forEach(function(type){
        h += '<br />' + type + '<br />';
        [ '200', '100x100', 'x60', '35', '10x10', 'x35', '60', '100x150', 'x200' ].forEach(function(dim){
            h += img(type, '?dim=' + dim) + '&nbsp;';
        });
        h += '<br />' + img(type, '?dim=800x100') + '<br />';
    });
    h += '<br />original<br />' + img('crop','') + '</center>';
    res.send(h);
});


app.listen(3000);
console.log("running on http://127.0.0.1:3000");
