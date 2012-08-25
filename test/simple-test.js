var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    qt = require('../lib/quickthumb');

(function(){
    var ppath = path.normalize(__dirname + '/../public/images'),
        src = path.join(ppath, 'red.gif'),
        dst = path.join(ppath, 'red_converted.gif');

    qt.convert({
        src : src,
        dst : dst,
        width : 100,
        height : 100
    }, function(err, image){
        assert.ifError(err);
        assert.equal(image, dst);
        assert.ifError(fs.unlinkSync(image));
    });
})();
